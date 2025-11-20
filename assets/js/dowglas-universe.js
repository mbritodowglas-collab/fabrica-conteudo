// assets/js/dowglas-universe.js
// Exporta cada quadro (.du-block) do Dowglas Universe como PNG separado

document.addEventListener('DOMContentLoaded', () => {
  // Botão global de download
  const btn =
    document.getElementById('download-universe') ||
    document.querySelector('[data-download="dowglas-universe"]');

  if (!btn) {
    console.warn('[dowglas-universe] Botão de download não encontrado (#download-universe).');
    return;
  }

  // Cada QUADRO é uma .du-block (já criada no layout)
  const slides = Array.from(document.querySelectorAll('.du-block'));

  if (!slides.length) {
    console.warn('[dowglas-universe] Nenhum slide (.du-block) encontrado.');
    return;
  }

  console.log('[dowglas-universe] Slides encontrados:', slides.length);

  btn.addEventListener('click', async () => {
    try {
      if (typeof html2canvas !== 'function') {
        console.error('[dowglas-universe] html2canvas não está disponível. Confere o <script> do CDN.');
        return;
      }

      // Gera um slug a partir do título da aba
      const rawTitle = document.title || 'dowglas-universe';
      const baseTitle = rawTitle
        .replace(/·\s*Dowglas Universe/i, '') // tira o sufixo do título
        .trim()
        .toLowerCase()
        .replace(/[^\w]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'dowglas-universe';

      console.log('[dowglas-universe] Iniciando export com baseTitle:', baseTitle);

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];

        // Garante que o quadro atual está visível
        slide.scrollIntoView({ behavior: 'auto', block: 'center' });

        // Pequena pausa para o browser renderizar a posição
        await new Promise((resolve) => setTimeout(resolve, 80));

        console.log(`[dowglas-universe] Capturando slide ${i + 1}/${slides.length}…`);

        const canvas = await html2canvas(slide, {
          scale: 2,          // mais nítido
          useCORS: true,     // ajuda com imagens do GitHub/CDN
          backgroundColor: null // respeita o fundo do próprio slide
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