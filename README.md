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

- **💾 Banco de Dados SQLite com Sequelize** - Migração completa para uma arquitetura de banco de dados robusta e relacional.
- **📁 Persistência em %APPDATA%** - Dados e imagens salvos automaticamente na pasta do usuário para garantir persistência após atualizações.
- **🚀 Performance Nativa** - Interface Electron otimizada com backend Node.js integrado.
- **🎨 Design Moderno e Compacto** - Interface refinada com cards otimizados, imagens em destaque e rodapé fixo inteligente.
- **🔗 Gestão Completa de Conteúdo** - Campos para "Lido até", "Link de Acesso" e upload de imagens tanto na criação quanto na edição.
- **🛠️ Área Administrativa Unificada** - Gerenciamento simplificado de posts e categorias com interface padronizada.

## 🚀 Como Usar

### Pré-requisitos

- **Node.js**: v16 ou superior (para desenvolvimento).
- **Sistema**: Windows 10 ou superior.

### Execução em Desenvolvimento

1. **Instalar dependências**: `npm install`
2. **Iniciar o app**: `npm start`

### Geração de Executável (.exe)

Para gerar a versão standalone para Windows:
```bash
npm run dist
```
O executável será gerado na pasta `dist/win-unpacked/`.

## 📁 Estrutura do Projeto

```
├── src/
│   ├── controllers/    # Lógica de negócio (Post e Category)
│   ├── db/             # Configuração do Sequelize e SQLite
│   ├── models/         # Modelos de dados e associações
│   ├── public/         # CSS, JS e Imagens estáticas
│   └── views/          # Interfaces HTML (Index, Admin, Categorias, Post)
├── main.js             # Ponto de entrada Electron
└── package.json        # Dependências e scripts de build
```

## 🛠️ Tecnologias Utilizadas

- **Electron**: Framework para aplicativos desktop.
- **Node.js & Express**: Backend e servidor de API interno.
- **Sequelize**: ORM para manipulação do banco de dados.
- **SQLite3**: Banco de dados local leve e persistente.
- **Multer**: Gerenciamento de upload de imagens.

---

**Versão Autônoma v3.0.0**
_Sistema profissional de avaliações offline com arquitetura moderna._

## 🆕 Novidades da v3.0.0

- **Arquitetura MVC**: Código totalmente refatorado com Controllers, Models e Rotas para melhor manutenção.
- **Edição Avançada**: Agora é possível trocar a imagem, o link e o progresso de leitura diretamente no modal de edição.
- **Cards Imersivos**: Imagens de capa com maior destaque (320px) e enquadramento inteligente (object-fit).
- **Categorias Dinâmicas**: Sistema de categorias totalmente integrado ao banco de dados e refletido em tempo real no menu.
- **UI Consistente**: Botões e formulários padronizados em todas as telas administrativas e de visualização.
- **Rodapé Inteligente**: Layout Flexbox que mantém o rodapé na base da janela independente do conteúdo.
