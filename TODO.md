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
- [x] **Filtragem Avançada:** Botão para filtrar apenas os favoritos diretamente na Home.
- [x] **Portabilidade de Dados:** Sistema de Importação e Exportação de Backups (ZIP) com interface integrada.
- [x] **Suíte de Testes:** Testes unitários para serviços core (Backup e Posts).

## 🛠️ Sugestões de Melhorias (Próximas Passos)

### 🎨 UI & UX (Visual)
- [ ] **Temas Alternativos:** Adicionar seletor de temas (Crimson, Emerald, Rose Gold).
- [ ] **Modo Claro (Light Mode):** Opção para alternar entre escuro e claro.
- [ ] **Micro-interações:** Animações sutis ao favoritar ou deletar itens (Framer Motion ou CSS Transitions).
- [ ] **Preview de Imagem:** Ver a imagem em tamanho real ao clicar na capa na página de detalhes.

### ⚙️ Funcionalidades (Features)
- [ ] **Filtragem por Data:** Seletor para ver avaliações de um ano ou mês específico.
- [ ] **Busca por Nota:** Slider ou botões para buscar obras por faixa de avaliação (ex: 4+ estrelas).
- [ ] **Tags de Status:** Adicionar selos de "Lendo", "Concluído" ou "Abandonado" às obras.
- [x] **Exportação Custom:** Gerar arquivo PDF ou imagem formatada para redes sociais (Stories).
- [ ] **Edição em Lote:** Selecionar múltiplos posts no Admin para mudar a categoria de todos ao mesmo tempo.
- [ ] **Backup na Nuvem:** Integração opcional com Google Drive ou GitHub para salvar o banco fora do PC.
- [ ] **Sincronização em Nuvem:** Usar Firebase ou Supabase para manter o catálogo sincronizado entre PCs.

### 🛡️ Segurança & Performance
- [ ] **Login Admin:** Implementar um pequeno formulário de senha para travar a área administrativa.
- [ ] **Tratamento de Grandes Volumes:** Otimizar o Grid (Virtual List) para catálogos com mais de 1.000 avaliações.
- [ ] **Integração com APIs:** Buscar metadados (capa, sinopse, ano) via TMDB (Filmes) ou Google Books.
- [ ] **Edição em Lote:** Selecionar múltiplos posts no Admin para mudar categoria ou status coletivamente.
- [ ] **Custom shortcuts:** Atalhos de teclado (ex: Ctrl+N para novo post) para facilitar o uso.
- [ ] **Sistema de Tags Custom:** Além da categoria, permitir adicionar tags livres (ex: #épico, #suspense).

### ☁️ Sincronização & Cloud
- [ ] **Backup Automático Cloud:** Sincronizar o arquivo ZIP no Google Drive ou Dropbox.
- [ ] **Multi-dispositivo:** Backend leve (Firebase/Supabase) para ver o catálogo no celular.

## 🐛 Bugs Reportados

- [ ] **[BUG] Social Image Share Clipping:** Imagem gerada para Stories ainda apresenta cortes ou layout desalinhado em algumas resoluções de tela específicas (Windows DPI Scaling).
- [x] **[FIX] Duplicate Title Check:** Corrigido erro TypeError no Admin ao validar títulos de avaliações.
- [x] **[FIX] Select Dropdown UI:** Corrigido fundo branco em menus de seleção (Categoria/Status) em Dark Mode.

## 📝 Notas de Versão
- **v4.5.0:** Gráficos BI (Chart.js), Autocomplete e Unicidade.
- **v4.6.0:** Importador de Backup e Filtros de Favoritos na Home.
- **v4.8.0:** Status Tags, Filtros Temporais/Nota, Exportação PDF e Limpeza de Storage.
- **v4.9.0:** Social Image Share (Instagram Stories/WhatsApp) e Refinamento de UI.
- **v4.9.7:** Fix de Duplicatas, Refinamento de Captura Social e Correções de Estilo.
- **v4.9.8 (Atual):** Botão de Importação na UI, Refatoração do PostService e Suíte de Testes completa.
