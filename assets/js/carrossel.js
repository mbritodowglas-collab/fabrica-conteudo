// assets/js/carrossel.js
document.addEventListener('DOMContentLoaded', () => {
  const downloadBtn = document.getElementById('fc-download-carrossel');

  // Captura individual dos slides existentes no layout
  const slides = Array.from(document.querySelectorAll('.fc-slide'));

  if (!downloadBtn || !slides.length) return;

  downloadBtn.addEventListener('click', async () => {
    const slug = document.body.getAttribute('data-slug') || 'carrossel';

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];

      // Garante visibilidade no viewport para capturar corretamente
      slide.scrollIntoView({ behavior: 'instant', block: 'center' });

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
});