# Blog de Avaliações - Standalone Nativo 🖥️🌌

A evolução definitiva do **Blog de Avaliações**, agora operando como um Software Desktop 100% Nativo blindado e extremamente rápido. Substituímos toda a dependência que simulava navegadores web por comunicações de processos nativos, trazendo a melhor performance e segurança disponíveis no ecossistema Electron.

## ✨ Características (Versão 4.1.0 - Migrations & Logging Build)

### 🏎️ Arquitetura Exclusiva de Software Desktop

- **🚫 Sem Servidor HTTP:** O antigo Express.js local foi desativado. Portas IP locais bloqueadas nunca mais ("Sem Erros 3001/EADDRINUSE").
- **⚡ Comunicação IPC Nativa:** O frontend (janelas) dialoga direto com o backend operacional através de chamadas em memória (Preload Bridge), resultando em salvamentos e cargas de banco de dados instantâneas.
- **📁 Integração Real com OS:** O botão de Upload foi substituído por integrações de sistema! Agora você busca as Capas através da verdadeira "Caixa de Seleção do Windows".

### 🛡️ Nível de Segurança 4

- **🔐 Autenticação Padrão:** Área de Listagem e Criação Administrativas interceptadas por um componente de barreira lógica protegendo seus dados e notas caso seu PC fique exposto.
- **📦 Banco de Dados Offline (SqLite):** Total privacidade num banco sem contatos web. Relacional puro manipulado através da robustez do _Sequelize ORM_. Os Dados vivem no `%APPDATA%`, imunes tanto a atualizações de interface quanto à remoção da própria pasta raiz.
- **🔒 Política de Segurança de Conteúdo (CSP):** Implementada para prevenir ataques XSS e garantir carregamento seguro de recursos externos (Font Awesome, Phosphor Icons, etc.).
- **📊 Migrations do Sequelize:** Migração de `sync({ alter: true })` para sistema de migrations robusto, evitando problemas recorrentes de tabelas de backup e garantindo controle de versão do schema.
- **📝 Logging Estruturado:** Implementação de logging persistente com `electron-log`, salvando logs estruturados em arquivos no diretório do usuário para debugging e monitoramento.
- **🛠️ Tratamento Global de Erros:** Handlers para `uncaughtException` e `unhandledRejection`, capturando e logando erros não tratados para maior estabilidade.

### 🎨 Premium Glassmorphism UI

- **🔮 Estilização:** Toda a lógica HTML crua foi varrida, substituída por classes utilitárias CSS globais padronizando espaçamentos num elegante **Dark Theme** com efeitos vítreos de desfoque, gradientes roxos (accent text) e bordas suaves.
- **📈 Dashboard do Administrador:** Informações estatísticas inteligentes calculadas via SQLite alimentando um sumário rápido sobre Obras Avaliadas, Média Geral, e Número de Categorias no topo da tela Admin.
- **📱 Flex & Responsividade:** Menus adaptativos e Modal de Edição Auto-Scroll (Ajuste independente da resolução do Windows do usuário).
- **🖼️ Gerenciamento de Imagens:** Imagens de capa armazenadas diretamente no banco como URLs de dados (base64), eliminando dependências de arquivos externos e protocolos customizados.

### 🛠️ Tecnologias Utilizadas

- **Electron:** Framework para aplicações desktop multiplataforma.
- **SQLite + Sequelize:** Banco de dados relacional leve e ORM para manipulação de dados.
- **Sequelize CLI:** Ferramenta para gerenciamento de migrations do banco de dados.
- **electron-log:** Biblioteca para logging estruturado e persistente em aplicações Electron.
- **EasyMDE:** Editor Markdown integrado para criação de avaliações.
- **Phosphor Icons:** Biblioteca de ícones moderna e leve.
- **CSS Grid/Flexbox:** Layout responsivo e moderno.
- **IPC (Inter-Process Communication):** Comunicação segura entre processos do Electron.

## 🚀 Como Executar ou Empacotar

### Pré-requisitos

- **Node.js**: Instalado (Para compilar e desenvolver).

### Desenvolvimento Local

1. **Instalar dependências de Motor**: `npm install`
2. **Rodar Ambiente**: `npm start` _(Roda de forma nativa já lendo as imagens direto do esquema AppData)_

### Geração de Mídia Instaladora (.exe)

Para obter uma versão autônoma entregável a qualquer amigo com Windows:

```bash
npm run dist
```

O `.exe` de instalação estará polido na pasta `dist/win-unpacked/` para ser hospedado ou fixado no menu iniciar.

## 📁 Estrutura Renovada

```
├── src/
│   ├── db/             # Conexão, migrations e configuração SQLite / Sequelize
│   │   ├── migrations/ # Scripts de migração do banco de dados
│   │   └── config.js   # Configuração do Sequelize CLI
│   ├── ipc-handlers.js # [CORE Backend] O processador de rotas de banco Native
│   ├── preload.js      # [Security] A ponte entre as janelas visuais e as engrenagens Core
│   ├── models/         # Estruturação e Relações do Database (Categories & Posts)
│   ├── public/
│   │   ├── css/        # Layout Centralizado, Utility Classes UI e Temas
│   │   └── js/         # Controladores da UI injetando os dados processados pelo Preload na tela
│   └── views/          # Grid Templates puros sem inline style
├── main.js             # Electron App Controller (Renderizador da View Nativa)
├── scripts/            # Scripts utilitários (ex: inicialização do banco)
├── data/               # Dados de exemplo (JSON para categorias e posts)
├── .sequelizerc        # Configuração de caminhos para Sequelize CLI
└── logs/               # Arquivos de log persistentes (gerados automaticamente)
```

## 🔧 Solução de Problemas

- **Erro de sincronização do banco:** Agora usando migrations do Sequelize. Se ocorrer problemas, execute `npx sequelize-cli db:migrate:undo` para reverter e `npx sequelize-cli db:migrate` para reaplicar.
- **Logs da aplicação:** Os logs são salvos automaticamente em `%APPDATA%\blog-avaliacoes-standalone\logs\main.log`. Verifique este arquivo para debugging detalhado.
- **Erros não tratados:** A aplicação agora captura e loga erros globais (uncaught exceptions e unhandled rejections) para maior estabilidade.
- **Imagens não carregam:** As imagens são armazenadas como data URLs no banco. Certifique-se de que o CSP permite `data:` em `img-src`.
- **CSP warnings:** Verifique se todos os domínios externos (cdn.jsdelivr.net, fonts.googleapis.com, etc.) estão permitidos no CSP das páginas HTML.

## 📝 Licença

Este projeto é de uso pessoal. Sinta-se à vontade para modificar e distribuir conforme necessário.

## 🛠️ Stack Modificada

- **Eletron Core & Builders**: Compilagem base.
- **Sequelize + Sqlite3 + Sequelize CLI**: Armazenamento Persistente Multi-Tabelas com sistema de migrations robusto.
- **electron-log**: Logging estruturado e persistente para debugging e monitoramento.
- ~~_Express.js / Multer / Fetch HTTP_~~ ➔ Removidos inteiramente por **Electron ipcMain/ipcRenderer** (Zero requisição local via APIs, toda a comunicação é via Memória Compartilhada).
- ~~_sync({ alter: true })_~~ ➔ Substituído por **Migrations do Sequelize** para controle de versão do schema e evitar problemas de backup.

---

Feito com excelência para quem consome muita ficção! 🏆
