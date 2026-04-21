// src/public/js/admin-view.js

let selectedImagePaths = {
    create: null,
    edit: null
};

let mdeCreate, mdeEdit;

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar Editores Markdown
    mdeCreate = new EasyMDE({
        element: document.getElementById('resumoCreate'),
        spellChecker: false,
        autosave: { enabled: false },
        placeholder: "O que você achou da obra? (Suporta Markdown)",
        status: false,
        minHeight: "200px"
    });

    mdeEdit = new EasyMDE({
        element: document.getElementById('resumoEdit'),
        spellChecker: false,
        autosave: { enabled: false },
        status: false,
        minHeight: "200px"
    });

    // Auth aprovada (Desenvolvimento): inicializar componentes
    carregarDashboard();
    carregarCategorias();
    carregarPosts();

    document.getElementById('formCriarPost').addEventListener('submit', criarPost);
    document.getElementById('formEditarPost').addEventListener('submit', atualizarPost);

    // Check if there is an edit param in URL (came from post.html)
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
        abrirEditar(editId);
    }

    // Bind to window for HTML onclick compatibility
    window.abrirEditar = abrirEditar;
    window.deletarPost = deletarPost;
    window.fecharModal = fecharModal;
    window.selectImageHandler = selectImageHandler;
    window.exportarBackup = exportarBackup;
    window.importarBackup = importarBackup;
});

async function exportarBackup() {
    try {
        showToast('Iniciando exportação de backup...', 'warning');
        const success = await BlogAPI.exportBackup();
        if (success) {
            showToast('Backup exportado com sucesso para a área de trabalho!', 'success');
        }
    } catch (error) {
        console.error('Erro ao exportar:', error);
        showToast('Falha ao exportar backup.', 'error');
    }
}

async function importarBackup() {
    if (!confirm('AVISO: Importar um backup substituirá todos os dados atuais e reiniciará o aplicativo. Deseja continuar?')) return;

    try {
        showToast('Iniciando importação de backup...', 'warning');
        const result = await BlogAPI.importBackup();
        
        if (result && result.success) {
            showToast('Backup importado! O aplicativo será reiniciado em instantes...', 'success');
        } else if (result && result.success === false) {
            showToast('Erro ao importar: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao importar:', error);
        showToast('Falha crítica ao importar backup.', 'error');
    }
}

async function carregarDashboard() {
    try {
        const stats = await BlogAPI.getDashboardStats();

        document.getElementById('dashboardSection').style.display = 'block';
        document.getElementById('statPosts').innerText = stats.totalPosts || 0;
        document.getElementById('statCats').innerText = stats.totalCats || 0;
        document.getElementById('statMedia').innerText = stats.mediaNotas || '0.0';
    } catch (err) {
        console.error('Falha ao carregar métricas:', err);
    }
}

// ---- [Nível 3] Componente de File Dialog Nativo ----
async function selectImageHandler(mode) {
    try {
        const absolutePath = await BlogAPI.selectImage();
        if (absolutePath) {
            selectedImagePaths[mode] = absolutePath;
            // Mostrar só o nome do arquivo, não todo o C:/... string para visual
            const baseName = absolutePath.split('\\').pop().split('/').pop();
            const spanId = mode === 'create' ? 'imgNameCreate' : 'imgNameEdit';
            document.getElementById(spanId).innerHTML = `<strong class="color-main">${baseName}</strong> (Pronto para Upload)`;
        }
    } catch (error) {
        console.error("Falha na caixa de seleção nativa.", error);
    }
}

async function carregarCategorias() {
    try {
        const categories = await BlogAPI.getCategories();
        const selectCreate = document.getElementById('selectCategoria');
        const selectEdit = document.getElementById('selectCategoriaEdit');

        // Limpar opções existentes (exceto a primeira)
        selectCreate.innerHTML = '<option value="">Selecione uma categoria...</option>';
        selectEdit.innerHTML = '<option value="">Selecione uma categoria...</option>';

        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            selectCreate.appendChild(opt.cloneNode(true));
            selectEdit.appendChild(opt);
        });
    } catch (err) { console.error(err); }
}

async function carregarPosts() {
    try {
        const posts = await BlogAPI.getAllPostsAdmin();
        const tbody = document.getElementById('listaPosts');

        if (posts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma avaliação cadastrada ainda.</td></tr>';
            return;
        }

        tbody.innerHTML = posts.map(post => `
            <tr>
                <td class="table-td-id">#${post.id}</td>
                <td class="table-td-title">${post.titulo}</td>
                <td><span class="table-tag">${post.Category ? post.Category.name : 'N/A'}</span></td>
                <td>${formatarData(post.createdAt)}</td>
                <td>
                    <div class="admin-table-actions">
                        <button class="btn-action btn-edit" onclick="abrirEditar(${post.id})"><i class="ph ph-pencil-simple"></i> Editar</button>
                        <button class="btn-action btn-delete" onclick="deletarPost(${post.id})"><i class="ph ph-trash"></i> Excluir</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        document.getElementById('listaPosts').innerHTML = '<tr><td colspan="5" class="text-center color-danger">Erro ao carregar os dados pelo IPC Nativo.</td></tr>';
    }
}

async function criarPost(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i> Publicando Nativamente...';
    submitBtn.disabled = true;

    // Convert form to Dict as IPC doesn't serialize FormData Objects
    const dataDict = {
        titulo: e.target.titulo.value,
        resumo: mdeCreate.value(),
        categoryId: e.target.categoryId.value,
        avaliacao: e.target.avaliacao.value,
        lido_ate: e.target.lido_ate.value,
        link_acesso: e.target.link_acesso.value,
        imageAbsPath: selectedImagePaths.create // Pass the absolute path chosen by Native picker
    };

    try {
        await BlogAPI.createPost(dataDict);
        e.target.reset();
        mdeCreate.value(''); // Limpar editor
        selectedImagePaths.create = null;
        document.getElementById('imgNameCreate').innerText = "Nenhuma selecionada";

        showToast('Avaliação criada com sucesso!', 'success');

        await carregarPosts();
        await carregarDashboard(); // Refresh stats!
    } catch (err) {
        showToast('Erro ao criar avaliação nativamente.', 'error');
        console.error(err);
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

async function deletarPost(id) {
    if (!confirm('Você tem certeza que deseja excluir esta avaliação irreversivelmente?')) return;
    try {
        await BlogAPI.deletePost(id);
        showToast('Avaliação removida com sucesso.', 'success');
        carregarPosts();
        carregarDashboard();
    } catch (err) {
        showToast('Erro ao deletar post via IPC', 'error');
    }
}

async function abrirEditar(id) {
    document.getElementById('modalOverlay').style.display = 'flex';

    const form = document.getElementById('formEditarPost');
    form.style.opacity = '0.5';

    try {
        const post = await BlogAPI.getPostById(id);

        form.id.value = post.id;
        form.titulo.value = post.titulo;
        mdeEdit.value(post.resumo || '');
        form.avaliacao.value = post.avaliacao;
        form.categoryId.value = post.categoryId || '';
        form.lido_ate.value = post.lido_ate || '';
        form.link_acesso.value = post.link_acesso || '';

        // Reset image edit state mapping
        selectedImagePaths.edit = null;
        document.getElementById('imgNameEdit').innerText = "Manter imagem atual";

        // Refrescar o layout do EasyMDE para evitar bugs visuais no modal
        setTimeout(() => mdeEdit.codemirror.refresh(), 100);

    } catch (err) {
        console.error(err);
        alert('Falha ao carregar detalhes do post Nativamente');
        fecharModal();
    } finally {
        form.style.opacity = '1';
    }
}

function fecharModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

async function atualizarPost(e) {
    e.preventDefault();
    const id = e.target.id.value;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i> Atualizando IPC...';
    submitBtn.disabled = true;

    // Convert form to Dict as IPC doesn't serialize FormData Objects
    const dataDict = {
        titulo: e.target.titulo.value,
        resumo: mdeEdit.value(),
        categoryId: e.target.categoryId.value,
        avaliacao: e.target.avaliacao.value,
        lido_ate: e.target.lido_ate.value,
        link_acesso: e.target.link_acesso.value,
        imageAbsPath: selectedImagePaths.edit // Only contains value if user opened Native Dialog again in edit modal
    };

    try {
        await BlogAPI.updatePost(id, dataDict);
        showToast('Avaliação atualizada com sucesso!', 'success');
        fecharModal();
        carregarPosts();
        carregarDashboard();
    } catch (err) {
        showToast('Erro ao atualizar avaliação.', 'error');
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}
