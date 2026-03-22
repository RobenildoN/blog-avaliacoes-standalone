# Blog de Avaliações - Versão Autônoma 🖥️

Uma versão completamente autônoma do Blog de Avaliações que funciona **sem servidor externo**, salvando todos os dados localmente no computador do usuário de forma segura e persistente.

## ✨ Características da Versão Autônoma

### 🔄 Funcionalidades Mantidas

- ✅ **Sistema completo de posts** - Criar, editar, deletar posts com salvamento automático.
- ✅ **Sistema de categorias** - Gerenciamento de Mangas, Livros, Filmes, Séries e Cursos.
- ✅ **Upload de imagens** - Imagens salvas localmente na pasta de dados do usuário.
- ✅ **Sistema de avaliação** - Classificação visual por estrelas.
- ✅ **Busca avançada** - Pesquisa inteligente por **título** e **resumo**.
- ✅ **Paginação inteligente** - Navegação otimizada por páginas.
- ✅ **Acesso livre** - Criação de posts disponível para todos, sem necessidade de login.

### 🆕 Recursos Exclusivos e Melhorias

- **💾 Armazenamento Híbrido** - Combina a portabilidade de arquivos JSON com a robustez do SQLite.
- **📁 Persistência em %APPDATA%** - Dados migrados automaticamente para a pasta do usuário para garantir permissões de escrita.
- **🚀 Performance Nativa** - Interface Electron otimizada com zero dependência de rede externa.
- **🔒 Segurança Total** - Dependências auditadas (0 vulnerabilidades) e dados 100% privados.
- **🎨 Layout Responsivo** - Novo design de rodapé fixo e área de conteúdo expansível.
- **🔗 Campo de Link Externo** - Agora você pode adicionar um link direto para o conteúdo avaliado.
- **📖 Progresso Visível** - O campo "Lido até" agora é exibido diretamente nos cards e na página do post.

## 🚀 Como Usar

### Pré-requisitos

- **Sistema**: Windows 10 ou superior.
- **Arquitetura**: x64.

### Instalação e Execução

1. **Localize o executável**: Na pasta `dist/win-unpacked/`, abra o `Blog de Avaliações - Autônomo.exe`.
2. **Primeira Execução**: A aplicação criará automaticamente a pasta de dados em `%APPDATA%/blog-avaliacoes-standalone/` e copiará o banco inicial.
3. **Uso Diário**: Basta abrir o executável e começar a criar suas avaliações.

## 📁 Estrutura de Dados (Caminho Real)

Os dados são salvos de forma persistente em:
`%APPDATA%/blog-avaliacoes-standalone/`

```
├── database.sqlite      # Estrutura do banco de dados
├── posts.json           # Dados dos posts (portátil)
├── categories.json      # Categorias personalizadas
└── images/              # Pasta com as imagens dos seus posts
```

## 🛠️ Desenvolvimento e Build

Se você deseja modificar o código ou gerar um novo executável:

### Comandos Principais

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvedor (com hot-reload)
npm start

# Gerar novo executável (.exe)
npm run dist
```

### Estrutura do Projeto

- `main.js`: Ponto de entrada do Electron e configuração da janela.
- `src/db/db.js`: Lógica de persistência e migração automática de dados.
- `src/models/`: Classes de dados (Post e Category) com métodos CRUD manuais.
- `src/public/`: Arquivos estáticos (CSS, JS e imagens padrão).
- `src/views/`: Interfaces HTML da aplicação.

## 🐛 Solução de Problemas

### Erro ao salvar dados

- Certifique-se de que não há outra instância da aplicação aberta.
- Verifique se a pasta em `%APPDATA%` possui permissões de escrita.

### Imagens não aparecem no .exe

- As imagens agora são servidas da pasta `userData`. Novos uploads funcionarão corretamente. Imagens antigas devem ser movidas para a pasta `images` em `%APPDATA%`.

### Rodapé desalinhado

- O layout foi corrigido para usar Flexbox. Se o problema persistir, limpe o cache da aplicação ou reinicie.

---

**Versão Autônoma v2.2.0**
_Desenvolvida para máxima portabilidade, privacidade e facilidade de uso._

## 🆕 Novidades da v2.2.0

- **Cards Compactos**: Reduzimos o tamanho dos cards em 20% e otimizamos o espaçamento para mostrar mais conteúdo na tela.
- **Link para Acesso**: Novo campo para adicionar URLs externas em cada post.
- **Visibilidade de Progresso**: O campo "Lido até" agora aparece tanto na listagem principal quanto nos detalhes do post.
- **Layout Inteligente**: O rodapé permanece fixo na base da janela mesmo em telas com pouco conteúdo.
- **Busca Aprimorada**: Pesquisa simultânea em títulos e resumos com feedback visual aprimorado.
