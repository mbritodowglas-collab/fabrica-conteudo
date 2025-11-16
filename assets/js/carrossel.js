// assets/js/carrossel.js
document.addEventListener('DOMContentLoaded', () => {
  const raw = document.getElementById('fc-raw');
  const slidesContainer = document.getElementById('fc-slides');
  const downloadBtn = document.getElementById('fc-download-slides');

  if (!raw || !slidesContainer) return;

  // Pega todos os filhos diretos (h2, p, listas etc.)
  const nodes = Array.from(raw.children);
  let currentSlide = null;

  nodes.forEach(node => {
    const tag = node.tagName;

    // Cada H2 inicia um novo slide
    if (tag === 'H2') {
      currentSlide = document.createElement('section');
      currentSlide.className = 'fc-slide';

      const h = document.createElement('h2');
      h.className = 'fc-slide__title';
      h.textContent = node.textContent.trim();

      currentSlide.appendChild(h);
      slidesContainer.appendChild(currentSlide);
      return;
    }

    // Outros elementos vão pro slide atual
    if (currentSlide) {
      currentSlide.appendChild(node.cloneNode(true));
    }
  });

  // some com o conteúdo bruto
  raw.style.display = 'none';

  // Se por algum motivo não criou slide nenhum, cria 1 com tudo
  if (!slidesContainer.children.length) {
    const fallback = document.createElement('section');
    fallback.className = 'fc-slide';
    fallback.innerHTML = raw.innerHTML;
    slidesContainer.appendChild(fallback);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      const slides = Array.from(document.querySelectorAll('.fc-slide'));
      if (!slides.length) return;

      const slug = document.body.getAttribute('data-slug') || 'carrossel';

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];

        // garante que o slide está visível no viewport para o html2canvas
        slide.scrollIntoView({ behavior: 'instant', block: 'center' });

        // captura o slide
        const canvas = await html2canvas(slide, {
          scale: 2
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
});