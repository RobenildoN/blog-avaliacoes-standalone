# Blog de Avaliações - Standalone Nativo 🖥️🌌

A evolução definitiva do **Blog de Avaliações**, agora operando como um Software Desktop 100% Nativo blindado e extremamente rápido. Substituímos toda a dependência que simulava navegadores web por comunicações de processos nativos, trazendo a melhor performance e segurança disponíveis no ecossistema Electron.

## ✨ Características (Versão 4.0.0 - IPC Build)

### 🏎️ Arquitetura Exclusiva de Software Desktop

- **🚫 Sem Servidor HTTP:** O antigo Express.js local foi desativado. Portas IP locais bloqueadas nunca mais ("Sem Erros 3001/EADDRINUSE").
- **⚡ Comunicação IPC Nativa:** O frontend (janelas) dialoga direto com o backend operacional através de chamadas em memória (Preload Bridge), resultando em salvamentos e cargas de banco de dados instantâneas.
- **📁 Integração Real com OS:** O botão de Upload foi substituído por integrações de sistema! Agora você busca as Capas através da verdadeira "Caixa de Seleção do Windows".

### 🛡️ Nível de Segurança 3

- **🔐 Autenticação Padrão:** Área de Listagem e Criação Administrativas interceptadas por um componente de barreira lógica protegendo seus dados e notas caso seu PC fique exposto.
- **📦 Banco de Dados Offline (SqLite):** Total privacidade num banco sem contatos web. Relacional puro manipulado através da robustez do _Sequelize ORM_. Os Dados vivem no `%APPDATA%`, imunes tanto a atualizações de interface quanto à remoção da própria pasta raiz.
- **🔒 Política de Segurança de Conteúdo (CSP):** Implementada para prevenir ataques XSS e garantir carregamento seguro de recursos externos (Font Awesome, Phosphor Icons, etc.).

### 🎨 Premium Glassmorphism UI

- **🔮 Estilização:** Toda a lógica HTML crua foi varrida, substituída por classes utilitárias CSS globais padronizando espaçamentos num elegante **Dark Theme** com efeitos vítreos de desfoque, gradientes roxos (accent text) e bordas suaves.
- **📈 Dashboard do Administrador:** Informações estatísticas inteligentes calculadas via SQLite alimentando um sumário rápido sobre Obras Avaliadas, Média Geral, e Número de Categorias no topo da tela Admin.
- **📱 Flex & Responsividade:** Menus adaptativos e Modal de Edição Auto-Scroll (Ajuste independente da resolução do Windows do usuário).
- **🖼️ Gerenciamento de Imagens:** Imagens de capa armazenadas diretamente no banco como URLs de dados (base64), eliminando dependências de arquivos externos e protocolos customizados.

### 🛠️ Tecnologias Utilizadas

- **Electron:** Framework para aplicações desktop multiplataforma.
- **SQLite + Sequelize:** Banco de dados relacional leve e ORM para manipulação de dados.
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
│   ├── db/             # Conexão e sincronização SQLite / Sequelize
│   ├── ipc-handlers.js # [CORE Backend] O processador de rotas de banco Native
│   ├── preload.js      # [Security] A ponte entre as janelas visuais e as engrenagens Core
│   ├── models/         # Estruturação e Relações do Database (Categories & Posts)
│   ├── public/
│   │   ├── css/        # Layout Centralizado, Utility Classes UI e Temas
│   │   └── js/         # Controladores da UI injetando os dados processados pelo Preload na tela
│   └── views/          # Grid Templates puros sem inline style
├── main.js             # Electron App Controller (Renderizador da View Nativa)
├── scripts/            # Scripts utilitários (ex: inicialização do banco)
└── data/               # Dados de exemplo (JSON para categorias e posts)
```

## 🔧 Solução de Problemas

- **Erro de sincronização do banco:** Se ocorrer erro de tabela de backup, delete o arquivo `database.sqlite` em `%APPDATA%\blog-avaliacoes-standalone\` e reinicie a aplicação.
- **Imagens não carregam:** As imagens são armazenadas como data URLs no banco. Certifique-se de que o CSP permite `data:` em `img-src`.
- **CSP warnings:** Verifique se todos os domínios externos (cdn.jsdelivr.net, fonts.googleapis.com, etc.) estão permitidos no CSP das páginas HTML.

## 📝 Licença

Este projeto é de uso pessoal. Sinta-se à vontade para modificar e distribuir conforme necessário.

## 🛠️ Stack Modificada

- **Eletron Core & Builders**: Compilagem base.
- **Sequelize + Sqlite3**: Armazenamento Persistente Multi-Tabelas.
- ~~_Express.js / Multer / Fetch HTTP_~~ ➔ Removidos inteiramente por **Electron ipcMain/ipcRenderer** (Zero requisição local via APIs, toda a comunicação é via Memória Compartilhada).

---

Feito com excelência para quem consome muita ficção! 🏆
