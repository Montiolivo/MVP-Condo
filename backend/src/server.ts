import express, { Application, Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import audioRoutes from './routes/audio.routes';

// Carregar variáveis de ambiente
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar express-fileupload
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '400') * 1024 * 1024 
  },
  abortOnLimit: true,
  responseOnLimit: 'Arquivo muito grande. Tamanho máximo: 400MB'
}));

// Rotas da API
app.use('/api/audio', audioRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'SGC-MVP Transcrição'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 Acesse: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app;
