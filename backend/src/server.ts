import express, { Application, Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import audioRoutes from './routes/audio.routes';
import { swaggerUi, swaggerSpec } from "./config/swagger.config";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares base
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Upload config
app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '400') * 1024 * 1024
  },
  abortOnLimit: true,
  responseOnLimit: 'Arquivo muito grande. Tamanho máximo permitido excedido.'
}));

// Rotas
app.use('/api/audio', audioRoutes);

// SWAGGER
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SGC-MVP Transcrição'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler global
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌎 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app;
