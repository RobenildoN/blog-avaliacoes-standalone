/**
 * script.js - Utilidades Globais da Aplicação Desktop
 */

(function () {
    // Configurar o comportamento Global do Electron para UI
    document.addEventListener('DOMContentLoaded', () => {

        // --- Customizações Globais ---

        // Prevenir redirecionamento ao arrastar arquivos no Windows (exceto se permitido pelo Electron)
        window.addEventListener('dragover', (e) => e.preventDefault(), false);
        window.addEventListener('drop', (e) => e.preventDefault(), false);

        // --- Ativação de Efeitos de UI ---

        // Suporte a Tooltips simples
        tippy('[data-tippy-content]', {
            theme: 'glass',
            arrow: false,
            animation: 'scale-subtle'
        });

        // Configurações de Formatação de Datas
        window.formatarData = (dataStr) => {
            const data = new Date(dataStr);
            return data.toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

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
                    <span>${mensagem}</span>
                </div>
            `;
            
            document.getElementById('notification-container').appendChild(toast);

            setTimeout(() => {
                toast.classList.add('animate-fade-out');
                setTimeout(() => toast.remove(), 400);
            }, 4000);
        };

        console.log('🌌 Blog de Avaliações: Global UI Loaded');
    });

})();
