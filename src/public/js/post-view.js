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
            postRating.innerHTML = '★'.repeat(post.avaliacao) + '☆'.repeat(5 - post.avaliacao);
            postDate.innerText = new Date(post.data_post).toLocaleDateString();
            
            // Imagem
            postImage.src = post.imagem ? (post.imagem.startsWith('http') ? post.imagem : 'img://' + post.imagem) : '../public/img/exemplo.jpg';
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

            // Gerenciar Botão de Edição
            editBtn.addEventListener('click', () => {
                window.location.href = `admin.html?edit=${id}`;
            });

        } catch (error) {
            console.error('Erro ao abrir post:', error);
            window.alertar('Erro ao carregar detalhes da obra.', 'error');
        }
    }

    // Iniciar
    carregarPost();
});
