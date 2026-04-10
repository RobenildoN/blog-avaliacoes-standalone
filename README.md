# Blog de Avaliações - Standalone Nativo 🖥️🌌

A evolução definitiva do **Blog de Avaliações**, agora operando como um Software Desktop 100% Nativo blindado e extremamente rápido na **versão 4.8.0**. Substituímos toda a dependência que simulava navegadores web por comunicações de processos nativos (IPC), trazendo a melhor performance e segurança disponíveis no ecossistema Electron.

## ✨ Características (Versão 4.8.0 - Organization & Export Update)

### 🆕 **O que há de novo na v4.8.0**

-   **🏷️ Selos de Status:** Acompanhe seu progresso com tags de "Lendo", "Concluído", "Em Espera" ou "Abandonado" com cores exclusivas.
-   **📅 Filtros Temporais e por Nota:** Encontre rapidamente obras assistidas em um ano/mês específico ou obras com nota 4+, 3+ ou 5 estrelas.
-   **📑 Exportação PDF (Share Card):** Gere uma ficha técnica elegante em PDF pronta para impressão ou compartilhamento social (Layout A5).
-   **🧹 Manutenção de Mídias:** Ferramenta integrada para identificar e remover arquivos de imagem órfãos, otimizando o armazenamento.
-   **📥 Importação de Backup:** Agora é possível restaurar todo o seu catálogo a partir de um arquivo ZIP.
-   **📊 Dashboard de BI (Chart.js):** Painel de estatísticas avançadas com gráficos de rosca por categoria, barras por nota e linha do tempo.

### 🏎️ Arquitetura Exclusiva de Software Desktop

-   **🚫 Sem Servidor HTTP:** O antigo Express.js local foi desativado. Portas IP locais bloqueadas nunca mais ("Sem Erros 3001/EADDRINUSE").
-   **⚡ Comunicação IPC Nativa:** O frontend dialoga direto com o backend operacional através de chamadas em memória (Preload Bridge), resultando em salvamentos e cargas de banco de dados instantâneas.
-   **📁 Integração Real com OS:** Diálogos nativos do Windows para seleção de arquivos, garantindo que o App gerencie suas capas de forma organizada na pasta `%APPDATA%`.

### 🛡️ Segurança e Estabilidade

-   **🔐 Autenticação Lógica:** Estrutura preparada para bloqueio de área administrativa por senha, protegendo suas notas e críticas.
-   **📦 Database Offline (SQLite):** Total privacidade num banco sem contatos web. Relacional puro manipulado via **Sequelize ORM**.
-   **🔄 Backup e Restauração:** Sistema completo de importação e exportação de backups ZIP, além de rotina automática diária às 02:00.
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
