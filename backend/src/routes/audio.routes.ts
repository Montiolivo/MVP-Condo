import { Router, Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import path from 'path';
import fs from 'fs/promises';
import prisma from '../lib/prisma';
import { validateAudioFile } from '../middleware/validateAudioFile';
import { uploadSchema } from '../config/upload.config';

const router = Router();

/**
 * @swagger
 * /audio/upload:
 *   post:
 *     summary: Upload de arquivo de áudio
 *     description: |
 *       POST /api/audio/upload  
 *       CA-001.01 - Upload cria registro com status pendente  
 *       RN-001.03 - Upload deve ser vinculado a um ID  
 *       RN-001.04 - Status inicial = "pendente"
 *     tags: [Áudio]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - usuarioId
 *               - audio
 *             properties:
 *               usuarioId:
 *                 type: string
 *               idReuniaoOuTeste:
 *                 type: string
 *               audio:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Upload realizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 */
router.post('/upload', validateAudioFile, async (req: Request, res: Response) => {
  try {
    // Validar dados do body
    const validation = uploadSchema.safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: validation.error.errors
      });
      return;
    }

    const { usuarioId, idReuniaoOuTeste } = validation.data;

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuario) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    const file = req.files!.audio as UploadedFile;
    
    // Gerar nome único para o arquivo
    const fileExtension = path.extname(file.name);
    const timestamp = Date.now();
    const nomeArmazenado = `${timestamp}-${Math.random().toString(36).substring(7)}${fileExtension}`;
    
    // Criar diretório de uploads se não existir
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Caminho completo do arquivo
    const caminhoArquivo = path.join(uploadDir, nomeArmazenado);
    
    // Salvar arquivo no disco
    await file.mv(caminhoArquivo);
    
    // RN-001.04 - Criar registro no banco com status PENDENTE
    const arquivoAudio = await prisma.arquivoAudio.create({
      data: {
        nomeOriginal: file.name,
        nomeArmazenado,
        caminhoArquivo,
        tamanhoBytes: file.size,
        formato: fileExtension.replace('.', ''),
        statusProcessamento: 'PENDENTE',
        idReuniaoOuTeste,
        usuarioId
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    // Iniciar processamento assíncrono da transcrição
    processTranscription(arquivoAudio.id, caminhoArquivo).catch(error => {
      console.error('Erro no processamento assíncrono:', error);
    });

    // CA-001.01 - Retornar sucesso com dados do registro criado
    res.status(201).json({
      success: true,
      message: 'Arquivo enviado com sucesso. Transcrição será processada em background.',
      data: {
        id: arquivoAudio.id,
        nomeOriginal: arquivoAudio.nomeOriginal,
        tamanhoBytes: arquivoAudio.tamanhoBytes,
        formato: arquivoAudio.formato,
        statusProcessamento: arquivoAudio.statusProcessamento,
        idReuniaoOuTeste: arquivoAudio.idReuniaoOuTeste,
        usuario: arquivoAudio.usuario,
        createdAt: arquivoAudio.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao processar upload:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar upload do arquivo'
    });
  }
});

/**
 * Processa a transcrição de forma assíncrona
 */
async function processTranscription(audioId: string, filePath: string): Promise<void> {
  let processedFiles: string[] = [];
  
  try {
    // Atualizar status para PROCESSANDO
    await prisma.arquivoAudio.update({
      where: { id: audioId },
      data: { statusProcessamento: 'PROCESSANDO' }
    });

    // Importar serviços
    const { transcribeAudio, isGroqConfigured } = await import('../services/transcription.service');
    const { processAudioFile, cleanupTempFiles } = await import('../services/audio-processing.service');

    // Verificar se o Groq está configurado
    if (!isGroqConfigured()) {
      throw new Error('API Key do Groq não configurada');
    }

    // Processar o áudio (comprimir/dividir se necessário)
    console.log(`🔄 Processando áudio ${audioId}...`);
    const processingResult = await processAudioFile(filePath);
    
    console.log(`📊 Tamanho original: ${(processingResult.originalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`📊 Tamanho processado: ${(processingResult.processedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`🗜️ Foi comprimido: ${processingResult.wasCompressed ? 'Sim' : 'Não'}`);

    // Se foi dividido em chunks, processar cada um
    if (processingResult.chunks && processingResult.chunks.length > 1) {
      console.log(`✂️ Arquivo dividido em ${processingResult.chunks.length} partes`);
      
      let fullTranscription = '';
      
      for (let i = 0; i < processingResult.chunks.length; i++) {
        const chunkPath = processingResult.chunks[i];
        console.log(`📝 Transcrevendo parte ${i + 1}/${processingResult.chunks.length}...`);
        
        // Adicionar delay entre chunks para evitar rate limiting (exceto no primeiro)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo entre chunks
        }
        
        const result = await transcribeAudio(chunkPath);
        fullTranscription += result.text + '\n\n';
        
        processedFiles.push(chunkPath);
      }

      // Salvar transcrição completa
      await prisma.arquivoAudio.update({
        where: { id: audioId },
        data: {
          statusProcessamento: 'CONCLUIDO',
          transcricao: fullTranscription.trim(),
          processadoEm: new Date()
        }
      });

      console.log(`✅ Transcrição concluída para arquivo ${audioId} (${processingResult.chunks.length} partes)`);
      
    } else {
      // Transcrever arquivo único (original ou comprimido)
      const result = await transcribeAudio(processingResult.processedPath);

      // Se foi comprimido, adicionar à lista de arquivos para limpar
      if (processingResult.wasCompressed && processingResult.processedPath !== filePath) {
        processedFiles.push(processingResult.processedPath);
      }

      // Atualizar registro com transcrição concluída
      await prisma.arquivoAudio.update({
        where: { id: audioId },
        data: {
          statusProcessamento: 'CONCLUIDO',
          transcricao: result.text,
          processadoEm: new Date()
        }
      });

      console.log(`✅ Transcrição concluída para arquivo ${audioId}`);
    }

    // Limpar arquivos temporários
    if (processedFiles.length > 0) {
      await cleanupTempFiles(processedFiles);
      console.log(`🧹 Arquivos temporários limpos`);
    }

  } catch (error: any) {
    console.error(`❌ Erro ao transcrever arquivo ${audioId}:`, error);

    // Mensagem de erro mais amigável
    let errorMessage = error.message || 'Erro desconhecido na transcrição';
    
    if (error.message?.includes('413') || error.message?.includes('too large')) {
      errorMessage = 'Arquivo muito grande para transcrição (máximo: 25MB)';
    }

    // Atualizar registro com erro
    await prisma.arquivoAudio.update({
      where: { id: audioId },
      data: {
        statusProcessamento: 'ERRO',
        erroProcessamento: errorMessage
      }
    });

    // Limpar arquivos temporários mesmo em caso de erro
    if (processedFiles.length > 0) {
      const { cleanupTempFiles } = await import('../services/audio-processing.service');
      await cleanupTempFiles(processedFiles);
    }
  }
}

/**
 * @swagger
 * /audio/{id}:
 *   get:
 *     summary: Buscar detalhes de um arquivo de áudio
 *     description: Retorna todos os dados do arquivo de áudio, incluindo informações do usuário.
 *     tags: [Áudio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do arquivo de áudio
 *     responses:
 *       200:
 *         description: Arquivo encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     nomeOriginal:
 *                       type: string
 *                     nomeArmazenado:
 *                       type: string
 *                     caminhoArquivo:
 *                       type: string
 *                     tamanhoBytes:
 *                       type: number
 *                     formato:
 *                       type: string
 *                     statusProcessamento:
 *                       type: string
 *                     idReuniaoOuTeste:
 *                       type: string
 *                     usuario:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         nome:
 *                           type: string
 *                         email:
 *                           type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Arquivo não encontrado
 *       500:
 *         description: Erro interno ao buscar o arquivo
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const arquivo = await prisma.arquivoAudio.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    if (!arquivo) {
      res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
      return;
    }

    res.json({
      success: true,
      data: arquivo
    });

  } catch (error) {
    console.error('Erro ao buscar arquivo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar arquivo'
    });
  }
});

/**
 * @swagger
 * /audio:
 *   get:
 *     summary: Lista todos os arquivos de áudio
 *     description: Retorna todos os registros de áudio, com filtro opcional por usuário e status de processamento.
 *     tags: [Áudio]
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID do usuário para filtrar os registros.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDENTE, PROCESSANDO, CONCLUIDO, ERRO]
 *         required: false
 *         description: Filtrar por status de processamento.
 *     responses:
 *       200:
 *         description: Lista de arquivos retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       nomeOriginal:
 *                         type: string
 *                       nomeArmazenado:
 *                         type: string
 *                       caminhoArquivo:
 *                         type: string
 *                       tamanhoBytes:
 *                         type: number
 *                       formato:
 *                         type: string
 *                       statusProcessamento:
 *                         type: string
 *                       idReuniaoOuTeste:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       usuario:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           nome:
 *                             type: string
 *                           email:
 *                             type: string
 *       500:
 *         description: Erro interno ao listar arquivos.
 */

router.get('/', async (req: Request, res: Response) => {
  try {
    const { usuarioId, status } = req.query;

    const where: any = {};
    
    if (usuarioId) {
      where.usuarioId = usuarioId as string;
    }
    
    if (status) {
      where.statusProcessamento = status as string;
    }

    const arquivos = await prisma.arquivoAudio.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      count: arquivos.length,
      data: arquivos
    });

  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar arquivos'
    });
  }
});

/**
 * @swagger
 * /audio/{id}/gerar-ata:
 *   post:
 *     summary: Gera uma ata estruturada baseada na transcrição do áudio
 *     description: |
 *       Inicia o processo assíncrono de geração de ata para um arquivo de áudio já transcrito.
 *       
 *       - O arquivo deve ter **statusProcessamento = CONCLUIDO**
 *       - Caso a ata já esteja sendo gerada, retorna erro 409
 *       - O processo ocorre em background e o usuário deve consultar o status posteriormente
 *     tags: [Áudio]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do arquivo de áudio
 *         schema:
 *           type: string
 *     responses:
 *       202:
 *         description: Processo de geração iniciado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     statusAta:
 *                       type: string
 *       400:
 *         description: A transcrição não está pronta para gerar a ata
 *       404:
 *         description: Arquivo não encontrado
 *       409:
 *         description: Ata já está sendo gerada
 *       500:
 *         description: Erro ao iniciar processo de geração da ata
 */

router.post('/:id/gerar-ata', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar o arquivo
    const arquivo = await prisma.arquivoAudio.findUnique({
      where: { id }
    });

    if (!arquivo) {
      res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
      return;
    }

    // Verificar se tem transcrição
    if (!arquivo.transcricao || arquivo.statusProcessamento !== 'CONCLUIDO') {
      res.status(400).json({
        success: false,
        error: 'Transcrição não disponível. O arquivo precisa estar com status CONCLUIDO.'
      });
      return;
    }

    // Verificar se já está gerando
    if (arquivo.statusAta === 'GERANDO') {
      res.status(409).json({
        success: false,
        error: 'Ata já está sendo gerada. Aguarde a conclusão.'
      });
      return;
    }

    // Iniciar processo de geração (assíncrono)
    generateAtaAsync(id, arquivo.transcricao).catch(error => {
      console.error('Erro no processamento assíncrono da ata:', error);
    });

    res.status(202).json({
      success: true,
      message: 'Geração da ata iniciada. Acompanhe o status.',
      data: {
        id: arquivo.id,
        statusAta: 'GERANDO'
      }
    });

  } catch (error) {
    console.error('Erro ao iniciar geração da ata:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao iniciar geração da ata'
    });
  }
});

/**
 * Processa a geração da ata de forma assíncrona
 */
async function generateAtaAsync(audioId: string, transcricao: string): Promise<void> {
  try {
    // Atualizar status para GERANDO
    await prisma.arquivoAudio.update({
      where: { id: audioId },
      data: { statusAta: 'GERANDO' }
    });

    console.log(`🤖 Gerando ata para arquivo ${audioId}...`);

    // Importar serviço de geração
    const { generateAta, isGroqConfigured } = await import('../services/ata-generation.service');

    // Verificar se o Groq está configurado
    if (!isGroqConfigured()) {
      throw new Error('API Key do Groq não configurada');
    }

    // Gerar ata usando Groq
    const result = await generateAta(transcricao);

    // Salvar ata no banco
    await prisma.arquivoAudio.update({
      where: { id: audioId },
      data: {
        ataGerada: true,
        textoAta: result.ata,
        statusAta: 'CONCLUIDA',
        ataGeradaEm: new Date()
      }
    });

    console.log(`✅ Ata gerada com sucesso para arquivo ${audioId}`);

  } catch (error: any) {
    console.error(`❌ Erro ao gerar ata para arquivo ${audioId}:`, error);

    // Mensagem de erro amigável
    let errorMessage = error.message || 'Erro desconhecido na geração da ata';

    // Atualizar registro com erro
    await prisma.arquivoAudio.update({
      where: { id: audioId },
      data: {
        statusAta: 'ERRO',
        erroAta: errorMessage
      }
    });
  }
}

export default router;
