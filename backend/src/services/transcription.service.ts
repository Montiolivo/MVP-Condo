import Groq from 'groq-sdk';
import fs from 'fs';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export interface TranscriptionResult {
  text: string;
  duration?: number;
  language?: string;
}

/**
 * Helper para adicionar delay entre requisições
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Transcreve um arquivo de áudio usando a API do Groq (Whisper)
 * @param filePath Caminho completo do arquivo de áudio
 * @param retries Número de tentativas em caso de erro
 * @returns Resultado da transcrição
 */
export async function transcribeAudio(
  filePath: string, 
  retries: number = 3
): Promise<TranscriptionResult> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        throw new Error('Arquivo não encontrado');
      }

      // Delay entre tentativas (exceto na primeira)
      if (attempt > 1) {
        const waitTime = attempt * 2000; // 2s, 4s, 6s...
        console.log(`⏳ Aguardando ${waitTime/1000}s antes da tentativa ${attempt}/${retries}...`);
        await delay(waitTime);
      }

      // Criar stream do arquivo
      const fileStream = fs.createReadStream(filePath);

      // Fazer a transcrição usando Groq Whisper
      const transcription = await groq.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-large-v3',
        prompt: 'Esta é uma transcrição de uma reunião de condomínio.',
        response_format: 'verbose_json',
        language: 'pt',
        temperature: 0.0
      });

      return {
        text: transcription.text,
        duration: transcription.duration,
        language: transcription.language
      };

    } catch (error: any) {
      lastError = error;
      console.error(`❌ Tentativa ${attempt}/${retries} falhou:`, error.message);
      
      // Se for o último retry, lança o erro
      if (attempt === retries) {
        break;
      }
      
      // Se for erro de conexão ou rate limit, tenta novamente
      if (error.message?.includes('Connection') || 
          error.message?.includes('ECONNRESET') ||
          error.status === 429 ||
          error.status === 503) {
        continue;
      }
      
      // Se for outro tipo de erro, não tenta novamente
      break;
    }
  }
  
  throw new Error(`Falha na transcrição após ${retries} tentativas: ${lastError.message || 'Erro desconhecido'}`);
}

/**
 * Verifica se a API Key do Groq está configurada
 */
export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here';
}
