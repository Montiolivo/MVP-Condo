import { Request, Response, NextFunction } from 'express';
import { UploadedFile } from 'express-fileupload';
import { 
  SUPPORTED_FORMATS, 
  MAX_FILE_SIZE_BYTES, 
  MAX_FILE_SIZE_MB,
  MIME_TYPES 
} from '../config/upload.config';

/**
 * RN-001.01 - Valida se o formato do arquivo é suportado
 */
export function validateFileFormat(file: UploadedFile): { valid: boolean; error?: string } {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (!fileExtension || !SUPPORTED_FORMATS.includes(fileExtension as any)) {
    return {
      valid: false,
      error: `Formato não suportado. Formatos aceitos: ${SUPPORTED_FORMATS.join(', ')}`
    };
  }

  // Validar MIME type também
  const validMimeTypes = MIME_TYPES[fileExtension as keyof typeof MIME_TYPES];
  if (!validMimeTypes.includes(file.mimetype as any)) {
    return {
      valid: false,
      error: `Tipo MIME inválido para o formato .${fileExtension}`
    };
  }

  return { valid: true };
}

/**
 * RN-001.02 - Valida se o tamanho do arquivo está dentro do limite
 */
export function validateFileSize(file: UploadedFile): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE_MB}MB`
    };
  }

  return { valid: true };
}

/**
 * Middleware para validação completa do arquivo de áudio
 * CA-001.02 - Arquivo inválido → erro claro
 * CA-001.03 - Arquivo maior que o limite → rejeitado
 */
export function validateAudioFile(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Verificar se há arquivo no upload
  if (!req.files || !req.files.audio) {
    res.status(400).json({
      success: false,
      error: 'Nenhum arquivo foi enviado'
    });
    return;
  }

  const file = req.files.audio as UploadedFile;

  // RN-001.01 - Validar formato
  const formatValidation = validateFileFormat(file);
  if (!formatValidation.valid) {
    res.status(400).json({
      success: false,
      error: formatValidation.error
    });
    return;
  }

  // RN-001.02 - Validar tamanho
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    res.status(400).json({
      success: false,
      error: sizeValidation.error
    });
    return;
  }

  next();
}
