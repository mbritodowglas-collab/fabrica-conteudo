// assets/js/dowglas-universe.js
// Exporta cada quadro (.du-block) do Dowglas Universe como PNG separado
// em formato 4:5 (ex: 1080x1350), ancorando o corte na parte inferior.

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

      // Gera um slug a partir do título da aba
      const rawTitle = document.title || 'dowglas-universe';
      const baseTitle = (
        rawTitle
          .replace(/·\s*Dowglas Universe/i, '') // tira o sufixo do título
          .trim()
          .toLowerCase()
          .replace(/[^\w]+/g, '-')
          .replace(/^-+|-+$/g, '')
      ) || 'dowglas-universe';

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];

        // Garante que o quadro atual está visível (ajuda na renderização)
        slide.scrollIntoView({ behavior: 'auto', block: 'center' });
        await new Promise((resolve) => setTimeout(resolve, 80));

        // Canvas "bruto" do slide, do jeito que está na tela
        const fullCanvas = await html2canvas(slide, {
          scale: 2,          // mais nítido
          useCORS: true,
          backgroundColor: null
        });

        const fullW = fullCanvas.width;
        const fullH = fullCanvas.height;

        // Queremos formato 4:5 (H = 1.25 * W)
        const cropW = fullW;
        let cropH = Math.round(fullW * 5 / 4);

        // Se por algum motivo o slide for mais baixo que isso,
        // limita o crop à própria altura.
        if (cropH > fullH) {
          cropH = fullH;
        }

        // Âncora embaixo: preserva o rodapé (Dowglas Universe) e
        // corta de cima, se precisar.
        const offsetY = Math.max(0, fullH - cropH);

        // Canvas intermediário com o recorte 4:5
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = cropW;
        cropCanvas.height = cropH;

        const cropCtx = cropCanvas.getContext('2d');
        cropCtx.drawImage(
          fullCanvas,
          0, offsetY,          // origem do recorte no canvas cheio
          cropW, cropH,        // tamanho do recorte
          0, 0,                // posição no canvas recortado
          cropW, cropH         // tamanho final no canvas recortado
        );

        // Agora escalamos para 1080 de largura (padrão Instagram)
        const targetW = 1080;
        const scale = targetW / cropW;
        const targetH = Math.round(cropH * scale); // deve ficar 1350 se tudo estiver 4:5

        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetW;
        finalCanvas.height = targetH;

        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.setTransform(scale, 0, 0, scale, 0, 0);
        finalCtx.drawImage(cropCanvas, 0, 0);
        finalCtx.setTransform(1, 0, 0, 1, 0, 0); // reseta transformação

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