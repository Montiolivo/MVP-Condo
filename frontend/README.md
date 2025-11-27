# SGC-MVP Frontend (React + Vite)

Interface web moderna para gerenciamento de transcrições de áudio e visualização de atas.

## 🚀 Tecnologias

- **React** 18.3.1
- **Vite** 5.4.10
- **React Router DOM** 6.26.2
- **Axios** 1.7.7
- Design responsivo com CSS modules
- Tema claro/escuro

## 📋 Pré-requisitos

- **Node.js 18+**
- **Backend rodando** em http://localhost:3000

## ⚙️ Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente (opcional)
cp .env.example .env
```

## 🏃 Executar

```bash
# Modo desenvolvimento (porta 3001)
npm run dev

# Build para produção
npm run build

# Visualizar build
npm run preview
```

O frontend estará disponível em: **http://localhost:3001**

## 📁 Estrutura

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas principais
│   │   ├── Listagem.jsx
│   │   ├── Detalhes.jsx
│   │   └── Ata.jsx
│   ├── services/       # Integração com API
│   │   └── api.js
│   ├── App.jsx         # Rotas principais
│   ├── main.jsx        # Entry point
│   └── index.css       # Estilos globais
├── public/             # Arquivos estáticos
├── index.html          # Template HTML
├── vite.config.js      # Configuração do Vite
└── package.json
```

## 🎨 Páginas

### 1. Listagem (`/listagem`)
- ✅ Visualizar todos os áudios transcritos
- ✅ Filtrar por status
- ✅ Upload de novos áudios com modal
- ✅ Acesso rápido às atas geradas
- ✅ Tema claro/escuro

### 2. Detalhes (`/detalhes/:id`)
- 🚧 Em desenvolvimento
- Visualizar transcrição completa
- Copiar/baixar transcrição
- Gerar ata

### 3. Ata (`/ata/:id`)
- 🚧 Em desenvolvimento
- Visualizar ata gerada
- Copiar/baixar ata
- Imprimir ata

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
VITE_API_URL=http://localhost:3000
```

### Proxy da API

O Vite está configurado para fazer proxy das requisições `/api` para o backend:

```javascript
// vite.config.js
server: {
  port: 3001,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

## 🎯 Funcionalidades Implementadas

- ✅ Sistema de rotas com React Router
- ✅ Upload de áudio com drag & drop
- ✅ Listagem com filtros dinâmicos
- ✅ Atualização automática (polling a cada 5s)
- ✅ Tema claro/escuro persistente
- ✅ Modal de upload responsivo
- ✅ Validação de arquivos
- ✅ Feedback visual (loading, alerts)
- ✅ Integração completa com API
- ✅ Design responsivo

## 📦 Build para Produção

```bash
# Gerar build otimizado
npm run build

# Arquivos estarão em dist/
```

Deploy em serviços como:
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **GitHub Pages**: Configure o workflow

**⚠️ Importante**: Atualizar `VITE_API_URL` com a URL do backend em produção.

## 🔄 Próximas Etapas

1. Converter página Detalhes.html para React
2. Converter página Ata.html para React
3. Adicionar testes unitários
4. Adicionar Context API para estado global
5. Implementar sistema de notificações toast

## 🐛 Debug

```bash
# Ver logs detalhados
npm run dev -- --debug

# Limpar cache do Vite
rm -rf node_modules/.vite
```

## 📚 Documentação

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
