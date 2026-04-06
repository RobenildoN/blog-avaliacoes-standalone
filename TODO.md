# 📋 TODO List - Blog de Avaliações Nativo

Este arquivo contém as tarefas concluídas e as sugestões de melhorias planejadas para o futuro da aplicação.

## ✅ Fase 1: MVP & Estabilização (Concluído)
- [x] **Arquitetura IPC:** Substituir o servidor Express por chamadas nativas de memória.
- [x] **Banco de Dados SQLite:** Persistência robusta com Sequelize e Migrations.
- [x] **Design Glassmorphism:** Novo tema Slate Blue refinado em toda a interface.
- [x] **Sistema de Favoritos:** Lógica de coração flutuante nos cards e no post.
- [x] **Resiliência de Imagens:** Mecanismo de 3 tentativas e placeholder de backup.
- [x] **Gestão de Categorias:** Validação de unicidade para evitar duplicatas.
- [x] **Dashboard Administrativo:** Estatísticas automáticas no topo da tela Admin.

## 🛠️ Sugestões de Melhorias (Próximas Passos)

### 🎨 UI & UX (Visual)
- [ ] **Temas Alternativos:** Adicionar seletor de temas (Crimson, Emerald, Rose Gold).
- [ ] **Modo Claro (Light Mode):** Opção para alternar entre escuro e claro.
- [ ] **Micro-interações:** Animações sutis ao favoritar ou deletar itens (Framer Motion ou CSS Transitions).
- [ ] **Preview de Imagem:** Ver a imagem em tamanho real ao clicar na capa na página de detalhes.

### ⚙️ Funcionalidades (Features)
- [ ] **Filtragem Avançada:** Botão para filtrar apenas os favoritos diretamente na Home.
- [ ] **Exportação em PDF:** Gerar um arquivo PDF ou imagem (social share) com a sua nota e resumo.
- [ ] **Edição em Lote:** Selecionar múltiplos posts no Admin para mudar a categoria de todos ao mesmo tempo.
- [ ] **Backup na Nuvem:** Integração opcional com Google Drive ou GitHub para salvar o banco fora do PC.

### 🛡️ Segurança & Performance
- [ ] **Login Admin:** Implementar um pequeno formulário de senha para travar a área administrativa.
- [ ] **Tratamento de Grandes Volumes:** Otimizar o Grid (Virtual List) para catálogos com mais de 1.000 avaliações.
- [ ] **Autocomplete:** Sugestões ao digitar títulos para evitar avaliações repetidas da mesma obra.

### 📊 Estatísticas (BI)
- [ ] **Gráficos Visuais:** Usar Chart.js para mostrar um gráfico de pizza por categorias ou barras por notas.
- [ ] **Linha do Tempo:** Ver quantas obras foram assistidas/lidas em cada mês do ano.

## 🐛 Bugs Reportados
*(Nenhum reportado até o momento na v4.2.1)*

---
### 📝 Notas de Versão
- **v4.2.1 (Atual):** Estabilização total do motor IPC e novo design Slate Blue.
- **v4.5.0 (Planejada):** Foco em Exportação e Filtros Avançados.
