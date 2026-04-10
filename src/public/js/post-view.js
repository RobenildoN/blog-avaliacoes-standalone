/**
 * PostView - Gerenciador da Página de Detalhes do Post
 * Renderiza o post completo com suporte a Markdown.
 */

document.addEventListener('DOMContentLoaded', () => {
    const postImage = document.getElementById('post-image');
    const postTitle = document.getElementById('post-title');
    const postCategory = document.getElementById('post-category');
    const postSummary = document.getElementById('post-summary');
    const postRating = document.getElementById('post-rating');
    const postDate = document.getElementById('post-date');
    const postLidoAte = document.getElementById('post-lido-ate');
    const postLidoContainer = document.getElementById('post-lido-container');
    const postLink = document.getElementById('post-link');
    const postLinkContainer = document.getElementById('post-link-container');
    const editBtn = document.getElementById('editPostBtn');

    // Inicialização do Conversor Markdown
    const converter = new showdown.Converter({
        headerLevelStart: 3,
        simplifiedAutoLink: true,
        strikethrough: true,
        tables: true,
        tasklists: true
    });

    // Obter ID da URL
    const getPostId = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    };

    // --- Carregamento de Dados ---

    async function carregarPost() {
        const id = getPostId();
        if (!id) {
            window.alertar('Post não encontrado!', 'error');
            setTimeout(() => window.location.href = 'index.html', 2000);
            return;
        }

        try {
            const post = await window.api.getPostById(id);
            
            // Preencher campos
            postTitle.innerText = post.titulo;
            postCategory.innerText = post.Category ? post.Category.name : 'Avaliação';
            
            const getStatusClass = (status) => {
                switch (status) {
                    case 'Lendo': return 'status-lendo';
                    case 'Em Espera': return 'status-espera';
                    case 'Abandonado': return 'status-abandonado';
                    default: return 'status-concluido';
                }
            };

            const statusHtml = `<span class="badge-status ${getStatusClass(post.status)}">${post.status || 'Concluído'}</span>`;
            postRating.innerHTML = `<span class="color-muted">Status:</span> ${statusHtml} &nbsp; <span class="color-muted">| Avaliação:</span> ` + '★'.repeat(post.avaliacao) + '☆'.repeat(5 - post.avaliacao);
            
            postDate.innerText = window.formatarData(post.data_post || post.createdAt);
            
            // Imagem
            postImage.src = post.imagem ? (post.imagem.startsWith('http') ? post.imagem : 'img://' + post.imagem) : 'https://via.placeholder.com/800x450/0f172a/94a3b8?text=Sem+Capa';
            postImage.onerror = () => window.handleImageError(postImage);

            // Markdown Content
            postSummary.innerHTML = converter.makeHtml(post.resumo || '');

            // Campos Opcionais
            if (post.lido_ate) {
                postLidoAte.innerText = post.lido_ate;
                postLidoContainer.style.display = 'block';
            }

            if (post.link_acesso) {
                postLink.href = post.link_acesso;
                postLinkContainer.style.display = 'block';
            }

            // Gerenciar Favoritos
            const favBtn = document.getElementById('btnFavorite');
            const updateFavVisual = (isFav) => {
                if (!favBtn) return;
                const icon = favBtn.querySelector('i');
                if (isFav) {
                    favBtn.classList.add('active');
                    icon.classList.remove('ph');
                    icon.classList.add('ph-fill');
                } else {
                    favBtn.classList.remove('active');
                    icon.classList.remove('ph-fill');
                    icon.classList.add('ph');
                }
            };
            
            updateFavVisual(post.favorito);
            
            // O onclick já está definido no HTML chamando toggleFavorito()
            // Mas vamos manter a lógica de atualização visual aqui.
            // O toggleFavorito no post-view.js cuidará de chamar updateFavVisual
            window.updateFavVisual = updateFavVisual; 

            // Gerenciar Botão de Edição
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    window.location.href = `admin.html?edit=${id}`;
                });
            }

        } catch (error) {
            console.error('Erro ao abrir post:', error);
            window.alertar('Erro ao carregar detalhes da obra.', 'error');
        }
    }

    // --- Ações ---

    window.exportarPDF = async () => {
        const id = getPostId();
        const btn = document.getElementById('btnExportPDF');
        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i> Gerando...';
            
            const result = await BlogAPI.exportPDF(id);
            if (result && result.success) {
                window.alertar('PDF gerado com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            window.alertar('Erro ao gerar PDF', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="ph ph-file-pdf"></i> Exportar PDF';
        }
    };

    window.toggleFavorito = async () => {
        const id = getPostId();
        const btn = document.getElementById('btnFavorite');
        try {
            const result = await window.api.toggleFavorito(id);
            if (result) {
                const icon = btn.querySelector('i');
                if (result.favorito) {
                    btn.classList.add('active');
                    icon.classList.remove('ph');
                    icon.classList.add('ph-fill');
                    window.alertar('Adicionado aos favoritos!', 'success');
                } else {
                    btn.classList.remove('active');
                    icon.classList.remove('ph-fill');
                    icon.classList.add('ph');
                    window.alertar('Removido dos favoritos.', 'info');
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar favorito:', error);
        }
    };

    // Iniciar
    carregarPost();
});
