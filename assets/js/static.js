// assets/js/static.js
document.addEventListener('DOMContentLoaded', () => {
  const card = document.getElementById('fc-static-card');
  const btn = document.getElementById('fc-download-static');

  if (!card || !btn) return;

  btn.addEventListener('click', async () => {
    card.scrollIntoView({ behavior: 'instant', block: 'center' });

    const canvas = await html2canvas(card, {
      scale: 2
    });

    const slug = document.body.getAttribute('data-slug') || 'post';
    const link = document.createElement('a');
    link.download = `${slug}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});