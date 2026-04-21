// src/public/js/post-view.js

// Função para obter o ID do post da URL
function getPostIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Função para carregar os detalhes do post
async function loadPostDetails() {
    const postId = getPostIdFromUrl();
    if (!postId) {
        document.getElementById('post-title').innerHTML = '<i class="ph ph-warning" style="color: var(--danger)"></i> Post não encontrado';
        return;
    }

    try {
        const post = await BlogAPI.getPostById(postId);

        // Preencher os elementos com os dados do post
        document.getElementById('post-title').textContent = post.titulo;
        // Tratar imagem com protocolo customizado se necessário
        let imageSrc = '../public/img/exemplo.jpg';
        if (post.imagem) {
            if (post.imagem.startsWith('http')) {
                imageSrc = post.imagem;
            } else if (post.imagem.startsWith('img://')) {
                imageSrc = post.imagem;
            } else {
                imageSrc = 'img://' + post.imagem;
            }
        }
        document.getElementById('post-image').src = imageSrc;
        document.getElementById('post-image').onerror = () => {
            if (typeof window.handleImageError === 'function') {
                window.handleImageError(document.getElementById('post-image'));
            } else {
                document.getElementById('post-image').src = '../public/img/exemplo.jpg';
            }
        };
        
        // Converter Markdown para HTML
        const converter = new showdown.Converter({
            tables: true,
            strikethrough: true,
            tasklists: true,
            simpleLineBreaks: true
        });
        document.getElementById('post-summary').innerHTML = converter.makeHtml(post.resumo || '');

        // Tratar link de acesso
        const linkContainer = document.getElementById('post-link-container');
        const linkElement = document.getElementById('post-link');
        if (post.link_acesso) {
            linkElement.href = post.link_acesso;
            linkContainer.style.display = 'block';
        } else {
            linkContainer.style.display = 'none';
        }

        // Tratar lido até
        const lidoContainer = document.getElementById('post-lido-container');
        const lidoElement = document.getElementById('post-lido-ate');
        if (post.lido_ate) {
            lidoElement.textContent = post.lido_ate;
            lidoContainer.style.display = 'block';
        } else {
            lidoContainer.style.display = 'none';
        }

        // Usando o formatarNota do script.js
        if (typeof formatarNota === 'function') {
            document.getElementById('post-rating').innerHTML = formatarNota(post.avaliacao);
        } else {
            document.getElementById('post-rating').textContent = '★'.repeat(post.avaliacao) + '☆'.repeat(5 - post.avaliacao);
        }
        
        // Usando o formatarData
        if (typeof formatarData === 'function') {
            document.getElementById('post-date').textContent = formatarData(post.createdAt || post.data_post);
        } else {
            document.getElementById('post-date').textContent = new Date(post.createdAt || post.data_post).toLocaleDateString('pt-BR');
        }
        
        document.getElementById('post-category').innerHTML = `<i class="ph ph-tag"></i> ` + (post.Category ? post.Category.name : 'N/A');
        
        const statusEl = document.getElementById('post-status');
        if (statusEl) {
            statusEl.textContent = post.status || 'Concluído';
            // Remover classes anteriores
            statusEl.classList.remove('status-lendo', 'status-espera', 'status-abandonado', 'status-concluido');
            // Adicionar nova classe
            const statusClass = (s) => {
                switch (s) {
                    case 'Lendo': return 'status-lendo';
                    case 'Em Espera': return 'status-espera';
                    case 'Abandonado': return 'status-abandonado';
                    default: return 'status-concluido';
                }
            };
            statusEl.classList.add(statusClass(post.status));
        }
        
        // Atualizar estado do botão de favorito
        const btnFav = document.getElementById('btnFavorite');
        const iconFav = btnFav.querySelector('i');
        if (post.favorito) {
            btnFav.classList.add('active');
            iconFav.classList.remove('ph');
            iconFav.classList.add('ph-fill');
        } else {
            btnFav.classList.remove('active');
            iconFav.classList.remove('ph-fill');
            iconFav.classList.add('ph');
        }
        
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('post-title').innerHTML = '<i class="ph ph-warning" style="color: var(--danger)"></i> Erro ao carregar post';
    }
}

// Carregar os detalhes do post ao carregar a página
document.addEventListener('DOMContentLoaded', async function () {
    loadPostDetails();

    // Mostrar botão editar sempre disponível
    const editBtn = document.getElementById('editPostBtn');
    editBtn.style.display = 'inline-flex';
    // Adicionar funcionalidade ao botão editar
    editBtn.addEventListener('click', function () {
        const postId = getPostIdFromUrl();
        if (postId) {
            window.location.href = `admin.html?edit=${postId}`;
        }
    });
});

async function toggleFavorito() {
    const postId = getPostIdFromUrl();
    if (!postId) return;

    const btnFav = document.getElementById('btnFavorite');
    const iconFav = btnFav.querySelector('i');

    try {
        const result = await BlogAPI.toggleFavorito(postId);
        if (result) {
            if (result.favorito) {
                btnFav.classList.add('active');
                iconFav.classList.remove('ph');
                iconFav.classList.add('ph-fill');
                if (typeof window.alertar === 'function') window.alertar('Adicionado aos favoritos!', 'success');
            } else {
                btnFav.classList.remove('active');
                iconFav.classList.remove('ph-fill');
                iconFav.classList.add('ph');
                if (typeof window.alertar === 'function') window.alertar('Removido dos favoritos.', 'info');
            }
        }
    } catch (error) {
        console.error('Erro ao alternar favorito:', error);
        if (typeof window.alertar === 'function') window.alertar('Erro ao atualizar favorito', 'error');
    }
}

// Bind to window
window.toggleFavorito = toggleFavorito;
