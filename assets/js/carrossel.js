// assets/js/carrossel.js
document.addEventListener('DOMContentLoaded', () => {

  /* ===========================
     DOWNLOAD DOS SLIDES
     =========================== */
  const downloadBtn = document.getElementById('download-carrossel');
  const slides = Array.from(document.querySelectorAll('.slide'));

  if (downloadBtn && slides.length) {
    downloadBtn.addEventListener('click', async () => {
      const slug = document.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'carrossel';

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];

        slide.scrollIntoView({ behavior: 'instant', block: 'center' });

        const canvas = await html2canvas(slide, {
          scale: 2,
          useCORS: true,
          backgroundColor: null
        });

        const link = document.createElement('a');
        const num = String(i + 1).padStart(2, '0');

        link.download = `${slug}-slide-${num}.png`;
        link.href = canvas.toDataURL('image/png');

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }


  /* ===========================
     MODAL DO PROMPT
     =========================== */

  const modal      = document.getElementById("fc-modal");
  const openModal  = document.querySelector(".fc-open-modal");
  const closeModal = document.getElementById("fc-close");
  const copyBtns   = document.querySelectorAll(".fc-copy-btn");

  // abrir modal
  if (openModal && modal) {
    openModal.addEventListener("click", () => {
      modal.style.display = "flex";
    });
  }

  // fechar modal
  if (closeModal && modal) {
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // copiar prompt (um botão por modelo)
  if (copyBtns && copyBtns.length) {
    copyBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".fc-prompt-card");
        if (!card) return;

        const textArea = card.querySelector("textarea");
        if (!textArea) return;

        textArea.select();
        document.execCommand("copy");

        const original = btn.textContent;
        btn.textContent = "Copiado!";
        setTimeout(() => {
          btn.textContent = original || "Copiar";
        }, 1500);
      });
    });
  }

});