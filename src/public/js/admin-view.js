/**
 * AdminView - Controlador para a Área Administrativa
 * Gerencia CRUD de posts, estatísticas e integração nativa com o Windows.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Estado da Interface
    let selectedImagePath = null; 
    let isEditing = false;

    // Elementos
    const formCriar = document.getElementById('formCriarPost');
    const formEditar = document.getElementById('formEditarPost');
    const selectCategoria = document.getElementById('selectCategoria');
    const selectCategoriaEdit = document.getElementById('selectCategoriaEdit');
    const listaPosts = document.getElementById('listaPosts');
    const modalOverlay = document.getElementById('modalOverlay');

    // Inicializar
    const init = async () => {
        setupMarkdownToolbar('toolbarCreate', 'resumoCreate');
        setupMarkdownToolbar('toolbarEdit', 'resumoEdit');
        setupAutocomplete();
        carregarDashboard();
        carregarCategorias();
        carregarPostsAdmin();
    };

    // --- Autocomplete de Títulos ---

    function setupAutocomplete() {
        const inputStore = document.querySelector('#formCriarPost input[name="titulo"]');
        const datalistStore = document.getElementById('titlesDatalist');
        const warningStore = document.getElementById('titleWarning');
        
        const inputEdit = document.querySelector('#formEditarPost input[name="titulo"]');
        const datalistEdit = document.getElementById('titlesDatalistEdit');
        const warningEdit = document.getElementById('titleWarningEdit');
        const idEdit = document.querySelector('#formEditarPost input[name="id"]');

        const handleInput = async (input, datalist, warning, excludeId = null) => {
            const query = input.value;
            if (query.trim().length === 0) {
                datalist.innerHTML = '';
                warning.style.display = 'none';
                return;
            }

            // Autocomplete (só se tiver 2+ caracteres)
            if (query.length >= 2) {
                try {
                    const titles = await window.api.searchPostTitles(query);
                    datalist.innerHTML = titles.map(t => `<option value="${t}">`).join('');
                } catch (error) {
                    console.error('Erro no autocomplete:', error);
                }
            }

            // Verificar se já existe (Duplicata)
            try {
                const isDuplicate = await window.api.checkPostTitleExists(query, excludeId);
                warning.style.display = isDuplicate ? 'inline' : 'none';
            } catch (error) {
                console.error('Erro ao verificar duplicata:', error);
            }
        };

        if (inputStore) {
            inputStore.addEventListener('input', () => handleInput(inputStore, datalistStore, warningStore));
        }

        if (inputEdit) {
            inputEdit.addEventListener('input', () => handleInput(inputEdit, datalistEdit, warningEdit, idEdit.value));
        }
    }

    // --- Dashboard & Estatísticas ---

    // Dashboard Charts Instances
    let chartCategory = null;
    let chartRating = null;
    let chartTimeline = null;

    async function carregarDashboard() {
        try {
            const stats = await window.api.getDashboardStats();
            document.getElementById('dashboardSection').style.display = 'block';
            document.getElementById('statPosts').innerText = stats.totalPosts || 0;
            document.getElementById('statCats').innerText = stats.totalCats || 0;
            document.getElementById('statMedia').innerText = stats.mediaNotas || '0.0';

            if (stats.charts) {
                renderCharts(stats.charts);
            }
        } catch (error) {
            console.warn('Dashboard não disponível ou vazio', error);
        }
    }
    function renderCharts(data) {
        // Cores padrões
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];
        
        // 1. Gráfico por Categoria (Pie)
        const canvasCat = document.getElementById('chartCategory');
        if (!canvasCat) return;
        const ctxCat = canvasCat.getContext('2d');
        if (chartCategory) chartCategory.destroy();
        chartCategory = new Chart(ctxCat, {
            type: 'doughnut',
            data: {
                labels: data.byCategory.map(c => c.name || 'Sem Categoria'),
                datasets: [{
                    data: data.byCategory.map(c => c.total),
                    backgroundColor: colors,
                    hoverOffset: 4,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, padding: 15 } }
                }
            }
        });

        // 2. Gráfico por Nota (Bar)
        const canvasRat = document.getElementById('chartRating');
        if (!canvasRat) return;
        const ctxRat = canvasRat.getContext('2d');
        if (chartRating) chartRating.destroy();
        
        const ratingLabels = [1, 2, 3, 4, 5];
        const ratingCounts = ratingLabels.map(r => {
            const found = data.byRating.find(d => d.avaliacao === r);
            return found ? found.total : 0;
        });

        chartRating = new Chart(ctxRat, {
            type: 'bar',
            data: {
                labels: ratingLabels.map(r => r + ' ⭐'),
                datasets: [{
                    label: 'Quantidade',
                    data: ratingCounts,
                    backgroundColor: '#f59e0b',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: '#2d3748' }, ticks: { stepSize: 1, color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                },
                plugins: { legend: { display: false } }
            }
        });

        // 3. Linha do Tempo (Line)
        const canvasTime = document.getElementById('chartTimeline');
        if (!canvasTime) return;
        const ctxTime = canvasTime.getContext('2d');
        if (chartTimeline) chartTimeline.destroy();

        chartTimeline = new Chart(ctxTime, {
            type: 'line',
            data: {
                labels: data.timeline.map(t => {
                   if (!t.month) return 'N/A';
                   const [y, m] = t.month.split('-');
                   const date = new Date(y, m-1);
                   return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
                }),
                datasets: [{
                    label: 'Novas Avaliações',
                    data: data.timeline.map(t => t.total),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6366f1',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: '#2d3748' }, ticks: { stepSize: 1, color: '#94a3b8' } },
                    x: { grid: { color: '#2d3748' }, ticks: { color: '#94a3b8' } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // --- Gerenciamento de Categorias (Selects) ---

    async function carregarCategorias() {
        try {
            const categories = await window.api.getCategories();
            const options = categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
            selectCategoria.innerHTML = '<option value="" disabled selected>Selecione uma categoria...</option>' + options;
            selectCategoriaEdit.innerHTML = '<option value="">Manter categoria atual</option>' + options;
        } catch (error) {
            console.error('Erro ao carregar categorias no admin');
        }
    }

    // --- Listagem de Posts ---

    async function carregarPostsAdmin() {
        try {
            const posts = await window.api.getAllPostsAdmin();
            if (!posts || posts.length === 0) {
                listaPosts.innerHTML = '<tr><td colspan="6" class="text-center font-0-9 color-muted">Nenhum post cadastrado.</td></tr>';
                return;
            }

            listaPosts.innerHTML = posts.map(post => `
                <tr>
                    <td>${post.id}</td>
                    <td class="fw-600">${post.titulo}</td>
                    <td><span class="badge">${post.Category ? post.Category.name : 'Vários'}</span></td>
                    <td class="font-0-8 color-muted">${new Date(post.data_post || post.createdAt).toLocaleDateString()}</td>
                    <td>
                        <div class="flex gap-5">
                            <button class="btn-icon" onclick="abrirModalEditar(${post.id})" title="Editar"><i class="ph ph-note-pencil color-info"></i></button>
                            <button class="btn-icon" onclick="deletarPost(${post.id})" title="Excluir"><i class="ph ph-trash color-danger"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Erro ao carregar lista de posts');
        }
    }

    // --- Criação de Posts ---

    if (formCriar) {
        formCriar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSubmit = formCriar.querySelector('button[type="submit"]');
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i> Publicando...';

            try {
                const formData = new FormData(formCriar);
                const data = Object.fromEntries(formData);
                
                // Enviar o caminho absoluto do arquivo selecionado
                if (selectedImagePath) {
                    data.imageAbsPath = selectedImagePath;
                }

                const result = await window.api.createPost(data);
                if (result && result.id) {
                    window.alertar('Avaliação publicada com sucesso!', 'success');
                    formCriar.reset();
                    selectedImagePath = null;
                    const previewImg = document.getElementById('previewCreate');
                    if (previewImg) {
                        previewImg.src = 'https://raw.githubusercontent.com/RobenildoN/temp-assets/main/placeholder-blog.png';
                    }
                    document.getElementById('imgNameCreate').innerText = 'Nenhuma selecionada';
                    document.getElementById('titleWarning').style.display = 'none'; // Resetar aviso
                    carregarPostsAdmin();
                    carregarDashboard();
                }
            } catch (error) {
                window.alertar('Erro ao criar post: ' + error.message, 'error');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = '<i class="ph ph-check-circle"></i> Publicar Avaliação';
            }
        });
    }

    // --- Edição de Posts ---

    window.abrirModalEditar = async (id) => {
        try {
            const post = await window.api.getPostById(id);
            formEditar.id.value = post.id;
            formEditar.titulo.value = post.titulo;
            formEditar.resumo.value = post.resumo;
            formEditar.avaliacao.value = post.avaliacao;
            formEditar.categoryId.value = post.categoryId || '';
            formEditar.status.value = post.status || 'Concluído';
            formEditar.lido_ate.value = post.lido_ate || '';
            formEditar.link_acesso.value = post.link_acesso || '';
            
            document.getElementById('imgNameEdit').innerText = 'Manter imagem atual';
            selectedImagePath = null; 
            
            const previewEdit = document.getElementById('previewEdit');
            if (previewEdit) {
                previewEdit.src = post.imagem ? (post.imagem.startsWith('http') ? post.imagem : 'img://' + post.imagem) : 'https://raw.githubusercontent.com/RobenildoN/temp-assets/main/placeholder-blog.png';
            }
            
            modalOverlay.style.display = 'flex';
        } catch (error) {
            window.alertar('Erro ao carregar dados para edição', 'error');
        }
    };

    window.fecharModal = () => {
        modalOverlay.style.display = 'none';
        formEditar.reset();
        document.getElementById('titleWarningEdit').style.display = 'none'; // Resetar aviso
    };

    if (formEditar) {
        formEditar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = formEditar.id.value;
            const btnSubmit = formEditar.querySelector('button[type="submit"]');
            btnSubmit.disabled = true;

            try {
                const formData = new FormData(formEditar);
                const data = Object.fromEntries(formData);
                
                if (selectedImagePath) {
                    data.imageAbsPath = selectedImagePath;
                }

                const result = await window.api.updatePost(id, data);
                if (result && result.id) {
                    window.alertar('Avaliação atualizada!', 'success');
                    fecharModal();
                    carregarPostsAdmin();
                }
            } catch (error) {
                console.error('Erro ao editar post:', error);
                window.alertar(error.message || 'Erro ao salvar alterações', 'error');
            } finally {
                btnSubmit.disabled = false;
            }
        });
    }

    // --- Exclusão de Posts ---

    window.deletarPost = async (id) => {
        if (!confirm('Deseja realmente excluir esta avaliação definitivamente?')) return;
        
        try {
            const result = await window.api.deletePost(id);
            if (result) {
                window.alertar('Post removido com sucesso.', 'success');
                carregarPostsAdmin();
                carregarDashboard();
            }
        } catch (error) {
            window.alertar('Erro ao deletar post', 'error');
        }
    };

    // --- Integração Nativa (Dialog de Imagem) ---

    window.selectImageHandler = async (mode) => {
        try {
            const path = await window.api.selectImage();
            if (path) {
                selectedImagePath = path;
                const fileName = path.split(/[\\/]/).pop();
                const targetLabel = mode === 'create' ? 'imgNameCreate' : 'imgNameEdit';
                const targetPreview = mode === 'create' ? 'previewCreate' : 'previewEdit';
                
                document.getElementById(targetLabel).innerText = fileName;
                
                const preview = document.getElementById(targetPreview);
                if (preview) {
                    preview.src = 'img://' + path;
                    preview.onerror = () => handleImageError(preview);
                }
                
                window.alertar('Capa selecionada!', 'success');
            }
        } catch (error) {
            window.alertar('Erro ao selecionar imagem', 'error');
        }
    };

    // --- Lógica do Editor Markdown ---

    function setupMarkdownToolbar(toolbarId, textareaId) {
        const toolbar = document.getElementById(toolbarId);
        const textarea = document.getElementById(textareaId);

        if (!toolbar || !textarea) return;

        toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const command = btn.getAttribute('data-command');
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = textarea.value.substring(start, end);
            let replacement = '';

            switch (command) {
                case 'bold': replacement = `**${selectedText || 'texto'}**`; break;
                case 'italic': replacement = `*${selectedText || 'texto'}*`; break;
                case 'strikethrough': replacement = `~~${selectedText || 'texto'}~~`; break;
                case 'heading': replacement = `\n# ${selectedText || 'Título'}`; break;
                case 'link': replacement = `[${selectedText || 'Link'}](https://...)`; break;
                case 'image': replacement = `![${selectedText || 'Descrição'}](img_url)`; break;
                case 'list': replacement = `\n- ${selectedText || 'Item'}`; break;
                case 'list-ordered': replacement = `\n1. ${selectedText || 'Item'}`; break;
                case 'quote': replacement = `\n> ${selectedText || 'Citação'}`; break;
                case 'code': replacement = `\`${selectedText || 'código'}\``; break;
                case 'code-block': replacement = `\n\`\`\`javascript\n${selectedText || '// código aqui'}\n\`\`\``; break;
            }

            textarea.setRangeText(replacement, start, end, 'select');
            textarea.focus();
        });
    }

    // Backup
    window.exportarBackup = async () => {
        try {
            window.alertar('Preparando backup. Selecione onde salvar...', 'info');
            const success = await window.api.exportBackup();
            if (success) {
                window.alertar('Backup exportado com sucesso!', 'success');
            }
        } catch (error) {
            window.alertar('Erro ao exportar backup', 'error');
        }
    };

    window.importarBackup = async () => {
        if (!confirm('ATENÇÃO: Importar um backup substituirá seu banco de dados atual e mesclará as imagens. Deseja prosseguir?')) return;
        
        try {
            window.alertar('Importando backup. Por favor aguarde...', 'info');
            const result = await window.api.importBackup();
            
            if (result && result.success) {
                window.alertar('Backup restaurado com sucesso! Recarregando dados...', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else if (result && result.error) {
                window.alertar('Erro ao importar: ' + result.error, 'error');
            }
        } catch (error) {
            window.alertar('Erro técnico ao importar backup', 'error');
        }
    };

    window.limparImagensOrfas = async () => {
        if (!confirm('Deseja procurar e excluir imagens que não pertencem a nenhuma avaliação? Isso economizará espaço em disco.')) return;
        
        try {
            window.alertar('Iniciando limpeza...', 'info');
            const result = await BlogAPI.cleanOrphanedImages();
            if (result && result.success) {
                window.alertar(`Limpeza concluída! ${result.count} arquivos removidos.`, 'success');
            }
        } catch (error) {
            console.error('Erro na limpeza:', error);
            window.alertar('Erro ao realizar limpeza de arquivos.', 'error');
        }
    };

    init();
});
