# Blog de Avaliações - Standalone Nativo 🖥️🌌

A evolução definitiva do **Blog de Avaliações**, agora operando como um Software Desktop 100% Nativo blindado e extremamente rápido. Substituímos toda a dependência que simulava navegadores web por comunicações de processos nativos, trazendo a melhor performance e segurança disponíveis no ecossistema Electron.

## ✨ Características (Versão 4.2.0 - Performance & Testing Build)

### 🆕 **Mudanças Recentes (v4.2.1)**

- **🗑️ Limpeza de Código:** Remoção completa de estilos CSS não utilizados relacionados ao EasyMDE
- **📝 Editor Markdown Customizado:** Substituição do EasyMDE por implementação própria com ícones Unicode
- **🎨 Tema Escuro Nativo:** Editor totalmente compatível com o tema escuro sem conflitos
- **⚡ Performance:** Redução significativa no tamanho do CSS e JavaScript
- **🔧 Manutenibilidade:** Código mais limpo e fácil de manter

### 🏎️ Arquitetura Exclusiva de Software Desktop

- **🚫 Sem Servidor HTTP:** O antigo Express.js local foi desativado. Portas IP locais bloqueadas nunca mais ("Sem Erros 3001/EADDRINUSE").
- **⚡ Comunicação IPC Nativa:** O frontend (janelas) dialoga direto com o backend operacional através de chamadas em memória (Preload Bridge), resultando em salvamentos e cargas de banco de dados instantâneas.
- **📁 Integração Real com OS:** O botão de Upload foi substituído por integrações de sistema! Agora você busca as Capas através da verdadeira "Caixa de Seleção do Windows".

### 🛡️ Nível de Segurança 5

- **🔐 Autenticação Padrão:** Área de Listagem e Criação Administrativas interceptadas por um componente de barreira lógica protegendo seus dados e notas caso seu PC fique exposto.
- **📦 Banco de Dados Offline (SqLite):** Total privacidade num banco sem contatos web. Relacional puro manipulado através da robustez do _Sequelize ORM_. Os Dados vivem no `%APPDATA%`, imunes tanto a atualizações de interface quanto à remoção da própria pasta raiz.
- **🔒 Política de Segurança de Conteúdo (CSP):** Implementada para prevenir ataques XSS e garantir carregamento seguro de recursos externos (Font Awesome, Phosphor Icons, etc.).
- **📊 Migrations do Sequelize:** Migração de `sync({ alter: true })` para sistema de migrations robusto, evitando problemas recorrentes de tabelas de backup e garantindo controle de versão do schema.
- **📝 Logging Estruturado:** Implementação de logging persistente com `electron-log`, salvando logs estruturados em arquivos no diretório do usuário para debugging e monitoramento.
- **🛠️ Tratamento Global de Erros:** Handlers para `uncaughtException` e `unhandledRejection`, capturando e logando erros não tratados para maior estabilidade.
- **🔄 Backup Automático:** Sistema de backup diário automático do banco e imagens, com limpeza automática de backups antigos (mantém últimos 30).
- **🔍 Busca Full-Text:** Índices FTS5 no SQLite para busca rápida e eficiente em títulos e resumos de posts.
- **🧪 Testes Unitários:** Suite completa de testes com Jest cobrindo services e funcionalidades críticas.

### 🎨 Premium Glassmorphism UI

- **🔮 Estilização:** Toda a lógica HTML crua foi varrida, substituída por classes utilitárias CSS globais padronizando espaçamentos num elegante **Dark Theme** com efeitos vítreos de desfoque, gradientes roxos (accent text) e bordas suaves.
- **� Editor Markdown Customizado:** Implementação própria de editor markdown com toolbar completa (negrito, itálico, listas, links, imagens, etc.) otimizada para tema escuro, sem dependências externas problemáticas.
- **�📈 Dashboard do Administrador:** Informações estatísticas inteligentes calculadas via SQLite alimentando um sumário rápido sobre Obras Avaliadas, Média Geral, e Número de Categorias no topo da tela Admin.
- **📱 Flex & Responsividade:** Menus adaptativos e Modal de Edição Auto-Scroll (Ajuste independente da resolução do Windows do usuário).
- **🖼️ Gerenciamento Otimizado de Imagens:** Imagens de capa armazenadas como arquivos no sistema (não mais base64), com cache inteligente e limpeza automática de arquivos órfãos.

### 🛠️ Tecnologias Utilizadas

- **Electron:** Framework para aplicações desktop multiplataforma.
- **SQLite + Sequelize:** Banco de dados relacional leve e ORM para manipulação de dados.
- **Sequelize CLI:** Ferramenta para gerenciamento de migrations do banco de dados.
- **SQLite FTS5:** Extensão Full-Text Search para buscas eficientes.
- **electron-log:** Biblioteca para logging estruturado e persistente em aplicações Electron.
- **Jest:** Framework de testes unitários para JavaScript.
- **node-cron:** Agendamento de tarefas automáticas (backup diário).
- **archiver:** Compressão de backups em formato ZIP.
- **Editor Markdown Customizado:** Implementação própria de editor com toolbar completa, sem dependências externas.
- **CSS Grid/Flexbox:** Layout responsivo e moderno.
- **IPC (Inter-Process Communication):** Comunicação segura entre processos do Electron.

## 🚀 Como Executar ou Empacotar

### Pré-requisitos

- **Node.js**: Instalado (Para compilar e desenvolver).

### Desenvolvimento Local

1. **Instalar dependências de Motor**: `npm install`
2. **Executar migrations**: `npx sequelize-cli db:migrate`
3. **Rodar Ambiente**: `npm start` _(Roda de forma nativa já lendo as imagens direto do esquema AppData)_
4. **Executar testes**: `npm test` ou `npm run test:coverage`

### Geração de Mídia Instaladora (.exe)

Para obter uma versão autônoma entregável a qualquer amigo com Windows:

```bash
npm run dist
```

O `.exe` de instalação estará polido na pasta `dist/win-unpacked/` para ser hospedado ou fixado no menu iniciar.

## 📁 Estrutura Renovada

```
├── src/
│   ├── db/
│   │   ├── migrations/ # Scripts de migração do banco de dados (FTS, índices)
│   │   └── config.js   # Configuração do Sequelize CLI
│   ├── ipc-handlers.js # [CORE Backend] O processador de rotas de banco Native
│   ├── preload.js      # [Security] A ponte entre as janelas visuais e as engrenagens Core
│   ├── models/         # Estruturação e Relações do Database (Categories & Posts)
│   ├── services/       # Lógica de negócio (PostService, BackupService)
│   ├── public/
│   │   ├── css/        # Layout Centralizado, Utility Classes UI e Temas
│   │   └── js/         # Controladores da UI injetando os dados processados pelo Preload na tela
│   └── views/          # Grid Templates puros sem inline style
├── tests/              # Testes unitários com Jest
├── main.js             # Electron App Controller (Renderizador da View Nativa)
├── scripts/            # Scripts utilitários (ex: inicialização do banco)
├── data/               # Dados de exemplo (JSON para categorias e posts)
├── .sequelizerc        # Configuração de caminhos para Sequelize CLI
├── jest.config.js      # Configuração de testes
└── logs/               # Arquivos de log persistentes (gerados automaticamente)
    backups/            # Backups automáticos diários (gerados automaticamente)
    images/             # Imagens otimizadas em cache (geradas automaticamente)
```

## 🔧 Solução de Problemas

- **Erro de sincronização do banco:** Agora usando migrations do Sequelize. Se ocorrer problemas, execute `npx sequelize-cli db:migrate:undo` para reverter e `npx sequelize-cli db:migrate` para reaplicar.
- **Logs da aplicação:** Os logs são salvos automaticamente em `%APPDATA%\blog-avaliacoes-standalone\logs\main.log`. Verifique este arquivo para debugging detalhado.
- **Erros não tratados:** A aplicação agora captura e loga erros globais (uncaught exceptions e unhandled rejections) para maior estabilidade.
- **Backups automáticos:** Backups diários são criados automaticamente em `%APPDATA%\blog-avaliacoes-standalone\backups\`. Os últimos 30 backups são mantidos automaticamente.
- **Busca não funciona:** Verifique se as migrations FTS foram executadas corretamente com `npx sequelize-cli db:migrate:status`.
- **Imagens não carregam:** As imagens são armazenadas como arquivos em `%APPDATA%\blog-avaliacoes-standalone\images\`. Certifique-se de que o diretório existe.
- **Testes falham:** Execute `npm test` para rodar a suite de testes. Certifique-se de que todas as dependências estão instaladas.
- **CSP warnings:** Verifique se todos os domínios externos (cdn.jsdelivr.net, fonts.googleapis.com, etc.) estão permitidos no CSP das páginas HTML.

## 📝 Licença

Este projeto é de uso pessoal. Sinta-se à vontade para modificar e distribuir conforme necessário.

## 🛠️ Stack Modificada

- **Eletron Core & Builders**: Compilagem base.
- **Sequelize + Sqlite3 + Sequelize CLI**: Armazenamento Persistente Multi-Tabelas com sistema de migrations robusto.
- **SQLite FTS5**: Busca full-text otimizada com índices especiais.
- **electron-log**: Logging estruturado e persistente para debugging e monitoramento.
- **Jest**: Framework de testes unitários com cobertura de código.
- **node-cron + archiver**: Backup automático diário com compressão ZIP.
- **Armazenamento de Arquivos**: Sistema otimizado de cache para imagens (não mais base64).
- ~~_Express.js / Multer / Fetch HTTP_~~ ➔ Removidos inteiramente por **Electron ipcMain/ipcRenderer** (Zero requisição local via APIs, toda a comunicação é via Memória Compartilhada).
- ~~_sync({ alter: true })_~~ ➔ Substituído por **Migrations do Sequelize** para controle de versão do schema e evitar problemas de backup.
- ~~_Base64 Images_~~ ➔ Substituído por **File-based Image Cache** para melhor performance e menor uso de memória.

---

Feito com excelência para quem consome muita ficção! 🏆
