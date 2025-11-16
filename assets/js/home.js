// assets/js/home.js
document.addEventListener('DOMContentLoaded', () => {
  const modal      = document.getElementById('fc-modal');
  const openBtn    = document.querySelector('.fc-open-modal');
  const closeBtn   = document.getElementById('fc-close');
  const backdrop   = modal ? modal.querySelector('.fc-modal__backdrop') : null;
  const copyBtns   = document.querySelectorAll('.fc-copy-btn');

  // ---------- abre modal ----------
  function openModal() {
    if (!modal) return;
    modal.classList.add('fc-modal--open');
    modal.setAttribute('aria-hidden', 'false');
  }

  // ---------- fecha modal ----------
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('fc-modal--open');
    modal.setAttribute('aria-hidden', 'true');
  }

  if (openBtn && modal) {
    openBtn.addEventListener('click', openModal);
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (backdrop && modal) {
    backdrop.addEventListener('click', closeModal);
  }

  // ESC para fechar
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closeModal();
  });

  // ---------- copiar prompts ----------
  copyBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = btn.closest('.fc-modal-card');
      if (!card) return;

      const textarea = card.querySelector('.fc-modal-text');
      if (!textarea) return;

      const text = textarea.value;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // fallback
          textarea.select();
          document.execCommand('copy');
        }
        const original = btn.textContent;
        btn.textContent = 'Copiado!';
        setTimeout(() => { btn.textContent = original; }, 1500);
      } catch (e) {
        console.error('Erro ao copiar prompt:', e);
      }
    });
  });
});