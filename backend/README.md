# SGC-MVP Backend

API REST para transcrição de áudios e geração de atas usando Groq AI.

## 🚀 Tecnologias

- **Node.js** 18+
- **TypeScript** 5.4.5
- **Express** 4.19.2
- **Prisma ORM** 5.22.0 (SQLite)
- **Groq SDK** 0.7.0 (Whisper + Llama)
- **fluent-ffmpeg** 2.1.3

## 📋 Pré-requisitos

1. **Node.js 18+** instalado
2. **FFmpeg** instalado no sistema
3. **API Key do Groq** ([console.groq.com](https://console.groq.com))

## ⚙️ Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env e adicionar sua GROQ_API_KEY

# Criar banco de dados
npx prisma migrate dev

# (Opcional) Popular com dados de teste
npx prisma db seed
```

## 🏃 Executar

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Modo produção
npm run build
npm start
```

O servidor estará rodando em: **http://localhost:3000**

## 📡 Endpoints da API

### Áudios
- `GET /api/audio` - Listar todos os áudios (com filtro opcional `?status=`)
- `GET /api/audio/:id` - Detalhes de um áudio
- `POST /api/audio/upload` - Upload de novo áudio
- `POST /api/audio/:id/gerar-ata` - Gerar ata a partir da transcrição

### Health Check
- `GET /health` - Status do servidor

## 📁 Estrutura

```
backend/
├── src/
│   ├── config/          # Configurações
│   ├── middleware/      # Validações
│   ├── routes/          # Endpoints da API
│   ├── services/        # Lógica de negócio
│   │   ├── transcription.service.ts
│   │   ├── audio-processing.service.ts
│   │   └── ata-generation.service.ts
│   └── server.ts
├── prisma/
│   └── schema.prisma    # Schema do banco
└── uploads/             # Arquivos de áudio
```

## 🔧 Configurações (.env)

```env
DATABASE_URL="file:./dev.db"
GROQ_API_KEY="sua-api-key-aqui"
PORT=3000
MAX_FILE_SIZE_MB=400
```

## 🧪 Testes

```bash
# Ver logs do servidor
npm run dev

# Testar endpoints
curl http://localhost:3000/health
```

## 📝 Modelos de IA

- **Transcrição**: `whisper-large-v3`
- **Geração de Ata**: `llama-3.1-8b-instant`

## 🔒 Segurança

- CORS habilitado para `http://localhost:3001`
- Validação de tipos de arquivo (mp3, wav, m4a)
- Limite de tamanho: 400MB por arquivo
- Sanitização de inputs

## 📚 Documentação Adicional

- [Setup do FFmpeg](../FFMPEG-SETUP.md)
- [Setup do Groq](../GROQ-SETUP.md)
- [Testes da API](../API-TESTS.md)
