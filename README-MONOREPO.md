# 🎙️ SGC-MVP - Sistema de Transcrição e Geração de Atas

MVP de sistema para transcrição automática de áudios de reuniões de condomínios e geração de atas estruturadas usando IA.

## 📦 Estrutura do Projeto

Este projeto foi separado em **dois repositórios independentes**:

```
SGC-MVP/
├── backend/          # API REST (Node.js + TypeScript + Express)
│   ├── src/
│   ├── prisma/
│   └── README.md
│
└── frontend/         # Interface Web (HTML/CSS/JS)
    ├── listagem.html
    ├── detalhes.html
    ├── ata.html
    └── README.md
```

## 🚀 Quick Start

### 1️⃣ Backend (API)

```bash
cd backend

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Edite .env e adicione sua GROQ_API_KEY

# Criar banco de dados
npx prisma migrate dev

# Iniciar servidor (porta 3000)
npm run dev
```

### 2️⃣ Frontend (Interface)

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor (porta 3001)
npm run dev
```

Acesse: **http://localhost:3001**

## 🎯 Funcionalidades

### ✅ Implementadas
- Upload de áudio (mp3, wav, m4a até 400MB)
- Transcrição automática com Groq Whisper Large V3
- Compressão e divisão de arquivos grandes
- Geração de atas estruturadas com Groq Llama 3.1
- Listagem com filtros por status
- Visualização de transcrições e atas
- Download em TXT e JSON
- Impressão de atas
- Tema claro/escuro (dark mode padrão)

### 🔜 Próximas Features
- Edição de transcrições
- Autenticação de usuários
- Dashboard com estatísticas
- Templates personalizados de atas
- Histórico de versões

## 🛠️ Tecnologias

### Backend
- Node.js 18+ & TypeScript 5.4.5
- Express 4.19.2
- Prisma ORM 5.22.0 (SQLite)
- Groq SDK 0.7.0
- fluent-ffmpeg 2.1.3

### Frontend
- HTML5 / CSS3 / JavaScript vanilla
- Live Server
- Design responsivo

## 📋 Pré-requisitos

- **Node.js 18+**
- **FFmpeg** ([guia de instalação](./FFMPEG-SETUP.md))
- **Groq API Key** ([obter em console.groq.com](https://console.groq.com))

## 📚 Documentação

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Setup FFmpeg](./FFMPEG-SETUP.md)
- [Setup Groq](./GROQ-SETUP.md)
- [Testes da API](./API-TESTS.md)
- [Tema Dark/Light](./THEME-DOCUMENTATION.md)
- [Quick Start](./QUICK-START.md)

## 🔧 Configuração

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
GROQ_API_KEY="sua-api-key-aqui"
PORT=3000
MAX_FILE_SIZE_MB=400
```

### Frontend (config.js)
```javascript
const API_CONFIG = {
  baseURL: 'http://localhost:3000'
};
```

## 🏗️ Arquitetura

```
┌─────────────┐      HTTP/REST      ┌──────────────┐
│   Frontend  │ ◄─────────────────► │   Backend    │
│  (Port 3001)│                      │  (Port 3000) │
└─────────────┘                      └──────┬───────┘
                                            │
                                            ▼
                                     ┌──────────────┐
                                     │   SQLite DB  │
                                     │   (dev.db)   │
                                     └──────────────┘
                                            │
                                            ▼
                                     ┌──────────────┐
                                     │   Groq API   │
                                     │ Whisper+Llama│
                                     └──────────────┘
```

## 📡 Fluxo de Dados

1. **Upload**: Frontend → Backend → Salva em `/uploads`
2. **Transcrição**: Backend → Groq Whisper → Salva no DB
3. **Geração de Ata**: Backend → Groq Llama → Salva no DB
4. **Visualização**: Frontend ← Backend ← DB

## 🧪 Testes

```bash
# Backend
cd backend
npm run dev

# Em outro terminal
curl http://localhost:3000/health

# Frontend
cd frontend
npm run dev
# Navegador abre automaticamente
```

## 🚢 Deploy

### Backend
- Recomendado: Railway, Render, Fly.io
- Banco: Migrar para PostgreSQL em produção
- Variáveis de ambiente: Configurar no painel do serviço

### Frontend
- Recomendado: Netlify, Vercel, GitHub Pages
- Build: Não necessário (arquivos estáticos)
- **Importante**: Atualizar `config.js` com URL do backend em produção

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Convenções de Commit

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração de código
- `test:` Testes
- `chore:` Manutenção

## 📄 Licença

MIT

## 👨‍💻 Autor

Desenvolvido como MVP para sistema de gestão de condomínios.

---

**⚠️ Nota**: Este é um MVP (Minimum Viable Product). Para uso em produção, considere adicionar:
- Autenticação e autorização
- Rate limiting
- Validações mais robustas
- Logs estruturados
- Monitoramento
- Backup automático do banco
- CDN para arquivos estáticos
