/**
 * CategoriasView - Controlador para a Gestão de Categorias
 */

document.addEventListener('DOMContentLoaded', () => {

    const formCriar = document.getElementById('formCriarCategoria');
    const formEditar = document.getElementById('formEditarCategoria');
    const containerCategorias = document.getElementById('categorias');
    const modalOverlay = document.getElementById('modalOverlay');

    const init = async () => {
        carregarCategorias();
    };

    // --- Carregamento de Dados ---

    async function carregarCategorias() {
        try {
            const categories = await window.api.getCategories();
            if (!categories || categories.length === 0) {
                containerCategorias.innerHTML = '<div class="text-center p-20 color-muted">Nenhuma categoria encontrada.</div>';
                return;
            }

            containerCategorias.innerHTML = categories.map(cat => `
                <div class="category-item flex justify-between items-center mb-10 p-15 bg-glass blur radius-md transition">
                    <div class="flex items-center gap-10">
                        <i class="ph ph-tag size-1-5 color-accent"></i>
                        <span class="fw-600 color-main">${cat.name}</span>
                    </div>
                    <div class="flex gap-5">
                        <button class="btn-icon" onclick="abrirModalEditar(${cat.id})" title="Editar"><i class="ph ph-note-pencil color-info"></i></button>
                        <button class="btn-icon" onclick="deletarCategoria(${cat.id})" title="Excluir"><i class="ph ph-trash color-danger"></i></button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Erro ao carregar categorias');
        }
    }

    // --- Criação de Categorias ---

    formCriar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = formCriar.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;

        try {
            const formData = new FormData(formCriar);
            const data = Object.fromEntries(formData);
            
            const result = await window.api.createCategory(data);
            if (result && result.id) {
                window.alertar('Categoria criada!', 'success');
                formCriar.reset();
                carregarCategorias();
            }
        } catch (error) {
            window.alertar(error.message || 'Erro ao criar categoria', 'error');
        } finally {
            btnSubmit.disabled = false;
        }
    });

    // --- Edição de Categorias ---

    window.abrirModalEditar = async (id) => {
        try {
            const cat = await window.api.getCategoryById(id);
            formEditar.id.value = cat.id;
            formEditar.name.value = cat.name;
            modalOverlay.style.display = 'flex';
        } catch (error) {
            window.alertar('Erro ao carregar dados', 'error');
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
            
            const result = await window.api.updateCategory(id, data);
            if (result.success) {
                window.alertar('Categoria atualizada!', 'success');
                fecharModal();
                carregarCategorias();
            }
        } catch (error) {
            window.alertar('Erro ao editar categoria', 'error');
        } finally {
            btnSubmit.disabled = false;
        }
    });

    // --- Exclusão de Categorias ---

    window.deletarCategoria = async (id) => {
        const confirmMsg = 'Aviso: Deletar esta categoria pode deixar posts órfãos ou removê-los dependendo da configuração. Deseja continuar?';
        if (!confirm(confirmMsg)) return;

        try {
            const result = await window.api.deleteCategory(id);
            if (result.success) {
                window.alertar('Categoria removida.', 'success');
                carregarCategorias();
            }
        } catch (error) {
            window.alertar('Erro ao deletar categoria', 'error');
        }
    };

    init();
});
