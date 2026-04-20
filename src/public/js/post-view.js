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
        document.getElementById('post-image').src = post.imagem || '../public/img/exemplo.jpg';
        
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
