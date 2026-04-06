/**
 * IndexView - Controlador para a Página Inicial (Listagem de Posts)
 * Implementa renderização dinâmica, paginação e filtros modernos.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Estado inicial
    let paginaAtual = 1;
    let totalPaginas = 1;
    let filtroCategoria = null;
    let termoBusca = '';
    let apenasFavoritos = false;
    let notaMinima = 0;

    // Elementos do DOM
    const postsContainer = document.getElementById('postsContainer');
    const categoriesNav = document.getElementById('categoriesNav');
    const searchBox = document.getElementById('searchBox');
    const paginationControls = document.getElementById('paginationControls');
    const pageInfo = document.getElementById('pageInfo');
    const sectionTitle = document.getElementById('sectionTitle');

    // Inicialização
    const init = async () => {
        carregarCategorias();
        carregarPosts();
    };

    // --- Funções de Carregamento ---

    async function carregarCategorias() {
        try {
            const categories = await BlogAPI.getCategories();
            
            // Remover apenas as categorias dinâmicas anteriores
            const linksDinâmicos = categoriesNav.querySelectorAll('li.dynamic-cat');
            linksDinâmicos.forEach(li => li.remove());

            // Encontrar o link do Admin para movê-lo ao final depois
            const adminLink = categoriesNav.querySelector('a[href="admin.html"]')?.parentElement;

            categories.forEach(cat => {
                const li = document.createElement('li');
                li.className = 'dynamic-cat';
                li.innerHTML = `<a href="#" onclick="filtrarPorCategoria(${cat.id}, this)">
                    <i class="ph ph-tag"></i> ${cat.name}
                </a>`;
                categoriesNav.appendChild(li);
            });

            // Mover Admin para o final se ele existir
            if (adminLink) categoriesNav.appendChild(adminLink);

        } catch (error) {
            console.error('Erro ao carregar menu de categorias:', error);
        }
    }

    // --- Filtros ---

    window.toggleFiltroFavoritos = (btn) => {
        apenasFavoritos = !apenasFavoritos;
        btn.classList.toggle('active');
        carregarPosts(1);
    };

    async function carregarPosts(page = 1) {
        postsContainer.innerHTML = `
            <div class="loading">
                <i class="ph ph-spinner-gap ph-spin size-2-5 color-accent"></i>
                <p>Carregando avaliações...</p>
            </div>`;
        
        try {
            let data;
            const params = { page, limit: 16 };

            if (notaMinima > 0) params.minRating = notaMinima;
            if (apenasFavoritos) params.onlyFavorites = true;

            if (termoBusca) {
                data = await BlogAPI.searchPosts(termoBusca, params);
            } else if (filtroCategoria) {
                data = await BlogAPI.getPostsByCategory(filtroCategoria, params);
            } else {
                data = await BlogAPI.getPosts(params);
            }

            renderizarPosts(data.posts || data);
            atualizarPaginacao(data.pagination || { currentPage: 1, totalPages: 1 });
            
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
            postsContainer.innerHTML = `<div class="error-msg">Erro ao carregar posts: ${error.message}</div>`;
        }
    }

    // --- Funções de Renderização ---

    function renderizarPosts(posts) {
        if (!posts || posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="text-center p-40 width-full">
                    <i class="ph ph-warning-circle size-3 opacity-0-5 mb-10"></i>
                    <p class="color-muted">Nenhuma avaliação encontrada.</p>
                </div>`;
            return;
        }

        postsContainer.innerHTML = posts.map(post => `
            <div class="post animate-fade-in" onclick="window.location.href='post.html?id=${post.id}'">
                <img src="${post.imagem ? (post.imagem.startsWith('http') ? post.imagem : 'img://' + post.imagem) : 'public/img/exemplo.jpg'}" alt="${post.titulo}" onerror="handleImageError(this)">
                <div class="post-content">
                    <h3 class="post-title">${post.titulo}</h3>
                    <div class="rating">
                        ${'★'.repeat(post.avaliacao)}${'☆'.repeat(5 - post.avaliacao)}
                    </div>
                    <p>${limitarTexto(post.resumo, 120)}</p>
                    <div class="post-footer flex justify-between items-center mt-15">
                        <span class="color-muted font-0-8"><i class="ph ph-tag"></i> ${post.Category ? post.Category.name : 'Vários'}</span>
                        <span class="color-accent font-0-9"><i class="ph ph-calendar"></i> ${new Date(post.data_post).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function atualizarPaginacao(pagination) {
        paginaAtual = pagination.currentPage;
        totalPaginas = pagination.totalPages;

        if (totalPaginas > 1) {
            paginationControls.style.display = 'flex';
            pageInfo.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
            document.getElementById('prevPageBtn').disabled = paginaAtual === 1;
            document.getElementById('nextPageBtn').disabled = paginaAtual === totalPaginas;
        } else {
            paginationControls.style.display = 'none';
        }
    }

    // --- Utilitários ---

    window.limitarTexto = function(texto, max) {
        if (!texto) return '';
        return texto.length > max ? texto.substring(0, max) + '...' : texto;
    };

    // --- Event Handlers (Globais para chamadas inline HTML) ---

    window.realizarBusca = () => {
        termoBusca = searchBox.value.trim();
        paginaAtual = 1;
        sectionTitle.innerHTML = termoBusca ? `<i class="ph ph-magnifying-glass"></i> Resultados para "${termoBusca}"` : `<i class="ph ph-clock-counter-clockwise"></i> Últimos Posts`;
        carregarPosts(1);
    };

    window.limparBusca = () => {
        searchBox.value = '';
        termoBusca = '';
        sectionTitle.innerHTML = `<i class="ph ph-clock-counter-clockwise"></i> Últimos Posts`;
        carregarPosts(1);
    };

    window.filtrarPorCategoria = (catId, el) => {
        // Resetar busca
        termoBusca = '';
        searchBox.value = '';
        
        // Ativar link no menu
        document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
        el.classList.add('active');

        filtroCategoria = catId;
        paginaAtual = 1;
        sectionTitle.innerHTML = `<i class="ph ph-tag"></i> Posts de ${el.innerText.trim()}`;
        carregarPosts(1);
    };

    window.mostrarTodosPosts = (el) => {
        filtroCategoria = null;
        window.filtrarPorCategoria(null, el);
        sectionTitle.innerHTML = `<i class="ph ph-clock-counter-clockwise"></i> Últimos Posts`;
    };

    window.mudarPagina = (delta) => {
        const novaPagina = paginaAtual + delta;
        if (novaPagina >= 1 && novaPagina <= totalPaginas) {
            carregarPosts(novaPagina);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    window.filtrarPorNota = (nota) => {
        notaMinima = (notaMinima === nota) ? 0 : nota; // Toggle
        // Estilização dos botões de estrela
        document.querySelectorAll('.btn-star-filter').forEach((btn, idx) => {
            if (idx + 1 <= notaMinima) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        carregarPosts(1);
    };

    // Tecla Enter na busca
    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') realizarBusca();
    });

    // Iniciar
    init();
});
