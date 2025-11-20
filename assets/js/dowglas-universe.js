// assets/js/dowglas-universe.js
// Exporta cada quadro (.du-block) do Dowglas Universe como PNG 1080x1350 (padrão Instagram)

document.addEventListener('DOMContentLoaded', () => {
  const btn =
    document.getElementById('download-universe') ||
    document.querySelector('[data-download="dowglas-universe"]');

  if (!btn) {
    console.warn('[dowglas-universe] Botão de download não encontrado (#download-universe).');
    return;
  }

  const slides = Array.from(document.querySelectorAll('.du-block'));

  if (!slides.length) {
    console.warn('[dowglas-universe] Nenhum slide (.du-block) encontrado.');
    return;
  }

  console.log('[dowglas-universe] Slides encontrados:', slides.length);

  btn.addEventListener('click', async () => {
    try {
      if (typeof html2canvas !== 'function') {
        console.error('[dowglas-universe] html2canvas não está disponível.');
        return;
      }

      const rawTitle = document.title || 'dowglas-universe';
      const baseTitle = rawTitle
        .replace(/·\s*Dowglas Universe/i, '')
        .trim()
        .toLowerCase()
        .replace(/[^\w]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'dowglas-universe';

      console.log('[dowglas-universe] Iniciando export com baseTitle:', baseTitle);

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];

        slide.scrollIntoView({ behavior: 'auto', block: 'center' });

        await new Promise((resolve) => setTimeout(resolve, 120));

        console.log(`[dowglas-universe] Capturando slide ${i + 1}/${slides.length}…`);

        const canvas = await html2canvas(slide, {
          width: 1080,
          height: 1350,
          windowWidth: 1080,
          windowHeight: 1350,
          scale: 1,            // garante tamanho exato
          useCORS: true,
          backgroundColor: null
        });

        const num = String(i + 1).padStart(2, '0');
        const filename = `${baseTitle}-slide-${num}.png`;

        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('[dowglas-universe] Download iniciado:', filename);
      }

    } catch (err) {
      console.error('[dowglas-universe] Erro ao gerar/baixar PNG:', err);
    }
  });
});