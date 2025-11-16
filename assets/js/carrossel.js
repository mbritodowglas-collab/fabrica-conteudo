// assets/js/carrossel.js
document.addEventListener('DOMContentLoaded', () => {
  const downloadBtn = document.getElementById('download-carrossel');

  const slides = Array.from(document.querySelectorAll('.slide'));

  if (!downloadBtn || !slides.length) return;

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
});