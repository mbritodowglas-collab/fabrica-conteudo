// assets/js/dowglas-universe.js
// Exporta cada quadro (.du-block) do Dowglas Universe como PNG separado
// em formato 4:5 (1080x1350), SEM cortar o conteúdo: apenas encaixa com letterbox.

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
      const baseTitle = (
        rawTitle
          .replace(/·\s*Dowglas Universe/i, '')
          .trim()
          .toLowerCase()
          .replace(/[^\w]+/g, '-')
          .replace(/^-+|-+$/g, '')
      ) || 'dowglas-universe';

      // padrão feed vertical IG
      const TARGET_W = 1080;
      const TARGET_H = 1350;

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];

        // garante que o quadro atual está renderizado
        slide.scrollIntoView({ behavior: 'auto', block: 'center' });
        await new Promise((resolve) => setTimeout(resolve, 80));

        // captura "bruta" do slide
        const fullCanvas = await html2canvas(slide, {
          scale: 2,
          useCORS: true,
          backgroundColor: null
        });

        const fullW = fullCanvas.width;
        const fullH = fullCanvas.height;

        // canvas final 4:5
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = TARGET_W;
        finalCanvas.height = TARGET_H;
        const ctx = finalCanvas.getContext('2d');

        // fundo preto (combina com o espaço)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, TARGET_W, TARGET_H);

        // escala uniforme para CABER inteiro dentro de 1080x1350
        const scale = Math.min(TARGET_W / fullW, TARGET_H / fullH);
        const drawW = fullW * scale;
        const drawH = fullH * scale;

        // centraliza o slide dentro do quadro 4:5
        const offsetX = (TARGET_W - drawW) / 2;
        const offsetY = (TARGET_H - drawH) / 2;

        ctx.drawImage(fullCanvas, offsetX, offsetY, drawW, drawH);

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