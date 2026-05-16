// Système de toast léger sans dépendance externe
type ToastType = 'success' | 'error' | 'warning' | 'info';

const COLORS: Record<ToastType, string> = {
  success: '#22c55e',
  error:   '#ef4444',
  warning: '#f59e0b',
  info:    '#3b82f6',
};

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

function show(message: string, type: ToastType, duration = 4000) {
  const existing = document.getElementById('toast-container');
  const container = existing ?? createContainer();

  const toast = document.createElement('div');
  toast.style.cssText = `
    display: flex; align-items: center; gap: 10px;
    background: #1e293b; color: #f1f5f9;
    border-left: 4px solid ${COLORS[type]};
    padding: 12px 16px; border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    font-family: Inter, sans-serif; font-size: 14px;
    max-width: 360px; animation: fadeIn 0.2s ease-out;
    pointer-events: auto;
  `;
  toast.innerHTML = `
    <span style="color:${COLORS[type]};font-weight:700;font-size:16px">${ICONS[type]}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function createContainer(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    display: flex; flex-direction: column; gap: 8px;
    pointer-events: none;
  `;

  const style = document.createElement('style');
  style.textContent = `@keyframes fadeIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`;
  document.head.appendChild(style);
  document.body.appendChild(container);
  return container;
}

const toast = {
  success: (msg: string, duration?: number) => show(msg, 'success', duration),
  error:   (msg: string, duration?: number) => show(msg, 'error', duration),
  warning: (msg: string, duration?: number) => show(msg, 'warning', duration),
  info:    (msg: string, duration?: number) => show(msg, 'info', duration),
};

export default toast;
