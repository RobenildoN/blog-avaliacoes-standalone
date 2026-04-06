# Blog de Avaliações - Standalone Nativo 🖥️🌌

A evolução definitiva do **Blog de Avaliações**, agora operando como um Software Desktop 100% Nativo blindado e extremamente rápido na **versão 4.2.1**. Substituímos toda a dependência que simulava navegadores web por comunicações de processos nativos (IPC), trazendo a melhor performance e segurança disponíveis no ecossistema Electron.

## ✨ Características (Versão 4.2.1 - Premium Slate Blue Edition)

### 🆕 **O que há de novo na v4.2.1**

-   **❤️ Sistema de Favoritos:** Botão de coração flutuante nos cards e na página do post com persistência instantânea no banco de dados.
-   **🖼️ Motor de Imagens Resiliente:** Lógica de 3 tentativas de carregamento via protocolo `img://` com fallback automático para placeholder online caso a mídia local seja movida ou deletada.
-   **🎨 Premium Slate Blue UI:** Novo esquema de cores baseado em tons *Slate* e *Ocean Blue* (`#0f172a`), com Glassmorphism refinado e tipografia moderna (Inter/Outfit).
-   **🛡️ SQL Sanitized:** Proteção total contra erros de injeção e valores `NaN` no banco de dados, garantindo buscas e filtros 100% estáveis.
-   **📏 Layout Reestruturado:** Cards com título acima da avaliação e página de detalhes com imagem centralizada e metadados organizados.

### 🏎️ Arquitetura Exclusiva de Software Desktop

-   **🚫 Sem Servidor HTTP:** O antigo Express.js local foi desativado. Portas IP locais bloqueadas nunca mais ("Sem Erros 3001/EADDRINUSE").
-   **⚡ Comunicação IPC Nativa:** O frontend dialoga direto com o backend operacional através de chamadas em memória (Preload Bridge), resultando em salvamentos e cargas de banco de dados instantâneas.
-   **📁 Integração Real com OS:** Diálogos nativos do Windows para seleção de arquivos, garantindo que o App gerencie suas capas de forma organizada na pasta `%APPDATA%`.

### 🛡️ Segurança e Estabilidade

-   **🔐 Autenticação Lógica:** Estrutura preparada para bloqueio de área administrativa por senha, protegendo suas notas e críticas.
-   **📦 Database Offline (SQLite):** Total privacidade num banco sem contatos web. Relacional puro manipulado via **Sequelize ORM**.
-   **🔄 Backup com um Clique:** Sistema de exportação de backup para a Área de Trabalho e rotina automática diária às 02:00 (mantém os últimos 30 dias).
-   **🔍 Busca Full-Text (FTS5):** Pesquisa instantânea em milissegundos dentro de títulos e conteúdos das avaliações.

### 🛠️ Stack Tecnológica

-   **Cérebro:** Electron + Node.js
-   **Memória:** SQLite 3 + Sequelize ORM (com Migrations)
-   **Interface:** Vanilla CSS (Slate Blue Theme) + Phosphor Icons + Tippy.js (Tooltips)
-   **Processamento:** Showdown (Markdown to HTML) + node-cron (Agendamentos)

## 🚀 Como Executar ou Empacotar

### Desenvolvimento Local
1. **Instalar dependências**: `npm install`
2. **Executar migrations**: `npx sequelize-cli db:migrate`
3. **Rodar Ambiente**: `npm start`

### Geração do Instalador (.exe)
Para obter uma versão autônoma entregável:
```bash
npm run dist
```
O `.exe` estará disponível na pasta `dist/`.

## 📁 Estrutura do Projeto
```
├── src/
│   ├── ipc/           # Handlers IPC (Comunicação Nativa)
│   ├── models/        # Schemas do SQLite (Sequelize)
│   ├── services/      # Lógica de Negócio (PostService, CategoryService)
│   ├── public/        # CSS (Design System) e JS (Controladores UI)
│   └── views/         # Arquivos HTML estruturais
├── main.js            # Electron Main Process
└── README.md          # Esta documentação
```

---
Feito com excelência para quem consome muita ficção e preza por organização! 🏆
