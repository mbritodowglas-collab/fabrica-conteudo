// assets/js/dowglas-universe.js
// Exporta cada quadro (.du-block) do Dowglas Universe como PNG separado
// em formato 4:5 (1080x1350). Agora o recorte é ANCORADO NO TOPO.

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

  btn.addEventListener('click', async () => {
    try {
      if (typeof html2canvas !== 'function') {
        console.error('[dowglas-universe] html2canvas não está disponível. Confere o <script> do CDN.');
        return;
      }

      // slug a partir do título da aba
      const rawTitle = document.title || 'dowglas-universe';
      const baseTitle =
        rawTitle
          .replace(/·\s*Dowglas Universe/i, '')
          .trim()
          .toLowerCase()
          .replace(/[^\w]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'dowglas-universe';

      // padrão feed vertical IG
      const TARGET_W = 1080;
      const TARGET_H = 1350;
      const TARGET_RATIO = TARGET_W / TARGET_H; // 0.8

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];

        // garante que o quadro atual está renderizado
        slide.scrollIntoView({ behavior: 'auto', block: 'start' });
        await new Promise((resolve) => setTimeout(resolve, 80));

        // captura "bruta" do slide (tela inteira)
        const fullCanvas = await html2canvas(slide, {
          scale: 2,
          useCORS: true,
          backgroundColor: null
        });

        const fullW = fullCanvas.width;
        const fullH = fullCanvas.height;
        const fullRatio = fullW / fullH;

        // Área de recorte mantendo proporção 4:5
        let sx, sy, sw, sh;

        if (fullRatio > TARGET_RATIO) {
          // Tela mais "larga" que 4:5 → corta laterais, mas usa altura INTEIRA
          sh = fullH;
          sw = Math.round(fullH * TARGET_RATIO);
          sx = Math.round((fullW - sw) / 2);
          sy = 0; // ancora no topo
        } else {
          // Tela mais "alta" que 4:5 → usa largura inteira e corta embaixo
          sw = fullW;
          sh = Math.round(fullW / TARGET_RATIO);
          sx = 0;
          sy = 0; // *** AQUI é a mudança: recorte começa no TOPO, não no meio ***
        }

        // canvas final 1080x1350
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = TARGET_W;
        finalCanvas.height = TARGET_H;
        const ctx = finalCanvas.getContext('2d');

        // recorta e ajusta para 1080x1350
        ctx.drawImage(
          fullCanvas,
          sx, sy, sw, sh,        // área recortada da captura
          0, 0, TARGET_W, TARGET_H // preenchendo todo o canvas final
        );

        const num = String(i + 1).padStart(2, '0');
        const filename = `${baseTitle}-slide-${num}.png`;

        const link = document.createElement('a');
        link.download = filename;
        link.href = finalCanvas.toDataURL('image/png');

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('[dowglas-universe] Erro ao gerar/baixar PNG:', err);
    }
  });
});