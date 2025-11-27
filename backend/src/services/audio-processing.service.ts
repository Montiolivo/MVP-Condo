import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { GROQ_MAX_FILE_SIZE_BYTES } from '../config/upload.config';

export interface AudioProcessingResult {
  processedPath: string;
  originalSize: number;
  processedSize: number;
  wasCompressed: boolean;
  chunks?: string[];
}

/**
 * Comprime um arquivo de áudio reduzindo o bitrate
 */
export async function compressAudio(
  inputPath: string,
  outputPath: string,
  targetBitrate: string = '64k'
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioBitrate(targetBitrate)
      .audioCodec('libmp3lame')
      .audioChannels(1) // Mono
      .audioFrequency(16000) // 16kHz (suficiente para voz)
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

/**
 * Divide um arquivo de áudio em chunks menores
 */
export async function splitAudioIntoChunks(
  inputPath: string,
  chunkDurationSeconds: number = 1200 // 20 minutos por padrão (~9.6MB por chunk com 64kbps, margem segura)
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const outputDir = path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const chunks: string[] = [];
    let chunkIndex = 0;

    // Primeiro, obter a duração total do áudio
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err);

      const duration = metadata.format.duration || 0;
      const numberOfChunks = Math.ceil(duration / chunkDurationSeconds);

      let processedChunks = 0;

      // Dividir em chunks com compressão
      for (let i = 0; i < numberOfChunks; i++) {
        const startTime = i * chunkDurationSeconds;
        const chunkPath = path.join(outputDir, `${baseName}_chunk_${i}.mp3`);
        chunks.push(chunkPath);

        ffmpeg(inputPath)
          .setStartTime(startTime)
          .setDuration(chunkDurationSeconds)
          .audioBitrate('64k') // Comprimir chunks
          .audioCodec('libmp3lame')
          .audioChannels(1) // Mono
          .audioFrequency(16000) // 16kHz
          .output(chunkPath)
          .on('end', () => {
            processedChunks++;
            if (processedChunks === numberOfChunks) {
              resolve(chunks);
            }
          })
          .on('error', (err) => reject(err))
          .run();
      }
    });
  });
}

/**
 * Processa o áudio automaticamente:
 * - Se <= 25MB: retorna o arquivo original
 * - Se > 25MB: tenta comprimir
 * - Se compressão não é suficiente: divide em chunks
 */
export async function processAudioFile(inputPath: string): Promise<AudioProcessingResult> {
  const stats = await fs.stat(inputPath);
  const originalSize = stats.size;

  // Se já está dentro do limite, retorna o original
  if (originalSize <= GROQ_MAX_FILE_SIZE_BYTES) {
    return {
      processedPath: inputPath,
      originalSize,
      processedSize: originalSize,
      wasCompressed: false
    };
  }

  // Tentar comprimir
  const compressedPath = inputPath.replace(path.extname(inputPath), '_compressed.mp3');
  
  try {
    await compressAudio(inputPath, compressedPath);
    const compressedStats = await fs.stat(compressedPath);
    
    // Se a compressão funcionou, retorna o arquivo comprimido
    if (compressedStats.size <= GROQ_MAX_FILE_SIZE_BYTES) {
      return {
        processedPath: compressedPath,
        originalSize,
        processedSize: compressedStats.size,
        wasCompressed: true
      };
    }

    // Se ainda está muito grande, divide o arquivo ORIGINAL em chunks
    // (chunks já serão comprimidos durante a divisão)
    console.log('⚠️ Arquivo comprimido ainda muito grande. Dividindo arquivo original em chunks comprimidos...');
    const chunks = await splitAudioIntoChunks(inputPath);
    
    // Adiciona o arquivo comprimido aos chunks para ser deletado depois
    chunks.push(compressedPath);
    
    // Calcular tamanho médio dos chunks
    const firstChunkStats = await fs.stat(chunks[0]);
    
    return {
      processedPath: chunks[0], // Retorna o primeiro chunk
      originalSize,
      processedSize: firstChunkStats.size,
      wasCompressed: true,
      chunks
    };

  } catch (error) {
    console.error('Erro ao processar áudio:', error);
    // Se falhar, tenta dividir o arquivo original
    const chunks = await splitAudioIntoChunks(inputPath);
    
    return {
      processedPath: chunks[0],
      originalSize,
      processedSize: originalSize,
      wasCompressed: false,
      chunks
    };
  }
}

/**
 * Limpa arquivos temporários de processamento
 */
export async function cleanupTempFiles(files: string[]): Promise<void> {
  for (const file of files) {
    try {
      await fs.unlink(file);
    } catch (error) {
      console.error(`Erro ao deletar arquivo temporário ${file}:`, error);
    }
  }
}
