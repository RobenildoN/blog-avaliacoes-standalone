(function () {
    // --- Utilitários Globais (Definição Imediata) ---

    // Gerenciamento de Notificações nativas na tela
    window.alertar = (mensagem, tipo = 'info') => {
        const container = document.getElementById('notification-container');
        if (!container) {
            const div = document.createElement('div');
            div.id = 'notification-container';
            document.body.appendChild(div);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo} bg-glass blur animate-fade-in`;
        toast.innerHTML = `
            <div class="toast-indicator bg-${tipo}"></div>
            <div class="toast-content p-15 flex items-center gap-10">
                <i class="ph-bold ph-${tipo === 'success' ? 'check-circle' : (tipo === 'error' ? 'prohibit-inset' : 'info')} color-${tipo}"></i>
                <span class="font-0-9 line-1-2">${mensagem}</span>
            </div>
        `;
        
        document.getElementById('notification-container').appendChild(toast);

        setTimeout(() => {
            toast.classList.add('animate-fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    };

    // Formatação de Datas
    window.formatarData = (dataStr) => {
        const data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Gerenciador de erro de imagens (Retry 3x)
    window.handleImageError = (img, fallbackUrl = 'https://via.placeholder.com/800x450/1e293b/94a3b8?text=Sem+Imagem') => {
        let retries = parseInt(img.dataset.retries || '0');
        
        if (retries < 3) {
            // Tentar novamente após um pequeno delay (500ms)
            img.dataset.retries = retries + 1;
            const currentSrc = img.src;
            img.src = ''; // Limpa para forçar o recarregamento
            setTimeout(() => {
                img.src = currentSrc;
            }, 500);
            console.warn(`[UI] Falha no carregamento. Tentativa ${retries + 1}/3 para: ${currentSrc}`);
        } else {
            // Falhou 3 vezes, para as requisições e mostra erro
            img.onerror = null; 
            img.src = fallbackUrl;
            img.classList.add('img-load-error');
            img.title = "Erro persistente ao carregar esta imagem.";
            
            // Tentar adicionar um aviso visual extra se houver um container
            const container = img.parentElement;
            if (container && !container.querySelector('.img-error-label')) {
                const label = document.createElement('div');
                label.className = 'img-error-label';
                label.innerText = 'ERRO';
                container.style.position = 'relative';
                container.appendChild(label);
            }
        }
    };

    // Configurar o comportamento Global do Electron para UI
    document.addEventListener('DOMContentLoaded', () => {

        // Prevenir redirecionamento ao arrastar arquivos no Windows
        window.addEventListener('dragover', (e) => e.preventDefault(), false);
        window.addEventListener('drop', (e) => e.preventDefault(), false);

        // Suporte a Tooltips (Apenas se a biblioteca tippy existir)
        if (typeof tippy !== 'undefined') {
            tippy('[data-tippy-content]', {
                theme: 'glass',
                arrow: false,
                animation: 'scale-subtle'
            });
        }

        console.log('🌌 Blog de Avaliações: Global UI Loaded');
    });

})();
