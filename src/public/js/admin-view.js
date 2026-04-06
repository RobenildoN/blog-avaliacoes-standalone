/**
 * AdminView - Controlador para a Área Administrativa
 * Gerencia CRUD de posts, estatísticas e integração nativa com o Windows.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Estado da Interface
    let selectedImageBase64 = null;
    let selectedImageFilename = null;
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
        carregarDashboard();
        carregarCategorias();
        carregarPostsAdmin();
    };

    // --- Dashboard & Estatísticas ---

    async function carregarDashboard() {
        try {
            const stats = await window.api.getDashboardStats();
            document.getElementById('dashboardSection').style.display = 'block';
            document.getElementById('statPosts').innerText = stats.totalPosts || 0;
            document.getElementById('statCats').innerText = stats.totalCategories || 0;
            document.getElementById('statMedia').innerText = (stats.averageRating || 0).toFixed(1);
        } catch (error) {
            console.warn('Dashboard não disponível ou vazio');
        }
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
                listaPosts.innerHTML = '<tr><td colspan="5" class="text-center font-0-9 color-muted">Nenhum post cadastrado.</td></tr>';
                return;
            }

            listaPosts.innerHTML = posts.map(post => `
                <tr>
                    <td>${post.id}</td>
                    <td class="fw-600">${post.titulo}</td>
                    <td><span class="badge">${post.Category ? post.Category.name : 'Vários'}</span></td>
                    <td class="font-0-8 color-muted">${new Date(post.data_post).toLocaleDateString()}</td>
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

    formCriar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = formCriar.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i> Publicando...';

        try {
            const formData = new FormData(formCriar);
            const data = Object.fromEntries(formData);
            
            // Adicionar imagem selecionada via dialog
            if (selectedImageBase64) {
                data.imagemBase64 = selectedImageBase64;
                data.imagemExt = selectedImageFilename.split('.').pop();
            }

            const result = await window.api.createPost(data);
            if (result.success) {
                window.alertar('Avaliação publicada com sucesso!', 'success');
                formCriar.reset();
                selectedImageBase64 = null;
                document.getElementById('imgNameCreate').innerText = 'Nenhuma selecionada';
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

    // --- Edição de Posts ---

    window.abrirModalEditar = async (id) => {
        try {
            const post = await window.api.getPostById(id);
            formEditar.id.value = post.id;
            formEditar.titulo.value = post.titulo;
            formEditar.resumo.value = post.resumo;
            formEditar.avaliacao.value = post.avaliacao;
            formEditar.categoryId.value = post.categoryId || '';
            formEditar.lido_ate.value = post.lido_ate || '';
            formEditar.link_acesso.value = post.link_acesso || '';
            
            document.getElementById('imgNameEdit').innerText = 'Manter imagem atual';
            selectedImageBase64 = null;
            
            modalOverlay.style.display = 'flex';
        } catch (error) {
            window.alertar('Erro ao carregar dados para edição', 'error');
        }
    };

    window.fecharModal = () => {
        modalOverlay.style.display = 'none';
        formEditar.reset();
    };

    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = formEditar.id.value;
        const btnSubmit = formEditar.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;

        try {
            const formData = new FormData(formEditar);
            const data = Object.fromEntries(formData);
            
            if (selectedImageBase64) {
                data.imagemBase64 = selectedImageBase64;
                data.imagemExt = selectedImageFilename.split('.').pop();
            }

            const result = await window.api.updatePost(id, data);
            if (result.success) {
                window.alertar('Avaliação atualizada!', 'success');
                fecharModal();
                carregarPostsAdmin();
            }
        } catch (error) {
            window.alertar('Erro ao editar: ' + error.message, 'error');
        } finally {
            btnSubmit.disabled = false;
        }
    });

    // --- Exclusão de Posts ---

    window.deletarPost = async (id) => {
        if (!confirm('Deseja realmente excluir esta avaliação definitivamente?')) return;
        
        try {
            const result = await window.api.deletePost(id);
            if (result.success) {
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
            const result = await window.api.selectImage();
            if (result && !result.canceled) {
                selectedImageBase64 = result.base64;
                selectedImageFilename = result.fileName;
                const targetLabel = mode === 'create' ? 'imgNameCreate' : 'imgNameEdit';
                document.getElementById(targetLabel).innerText = selectedImageFilename;
                window.alertar('Capa selecionada com sucesso!', 'success');
            }
        } catch (error) {
            window.alertar('Erro ao selecionar imagem do sistema', 'error');
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
            window.alertar('Processando backup. Por favor aguarde...', 'info');
            const result = await window.api.exportBackup();
            if (result.success) {
                window.alertar('Backup exportado para sua Área de Trabalho!', 'success');
            }
        } catch (error) {
            window.alertar('Erro ao exportar backup', 'error');
        }
    };

    init();
});
