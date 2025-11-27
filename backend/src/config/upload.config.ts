import { z } from 'zod';

// RN-001.01 - Formatos suportados: .mp3, .wav, .m4a
export const SUPPORTED_FORMATS = ['mp3', 'wav', 'm4a'] as const;

// RN-001.02 - Tamanho máximo 400 MB (em bytes)
export const MAX_FILE_SIZE_MB = 400;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Limite do Groq para transcrição (25 MB)
export const GROQ_MAX_FILE_SIZE_MB = 25;
export const GROQ_MAX_FILE_SIZE_BYTES = GROQ_MAX_FILE_SIZE_MB * 1024 * 1024;

// MIME types correspondentes
export const MIME_TYPES = {
  mp3: ['audio/mpeg', 'audio/mp3'],
  wav: ['audio/wav', 'audio/wave', 'audio/x-wav'],
  m4a: ['audio/m4a', 'audio/x-m4a', 'audio/mp4']
} as const;

// Schema de validação para upload
export const uploadSchema = z.object({
  usuarioId: z.string().uuid('ID de usuário inválido'),
  idReuniaoOuTeste: z.string().optional()
});

export type UploadInput = z.infer<typeof uploadSchema>;
