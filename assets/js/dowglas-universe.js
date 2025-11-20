// assets/js/dowglas-universe.js
// Download em PNG para o layout "Dowglas Universe"
// (textão quadro único ou multiquadros usando .fc-static-block)

document.addEventListener('DOMContentLoaded', () => {
  // Botão de download
  const btn =
    document.getElementById('download-universe') ||
    document.querySelector('[data-download="dowglas-universe"]');

  if (!btn) {
    console.warn('[dowglas-universe] Botão #download-universe não encontrado no DOM.');
    return;
  }

  // Cada quadro que deve virar PNG
  const blocks = Array.from(document.querySelectorAll('.fc-static-block'));

  if (!blocks.length) {
    console.warn('[dowglas-universe] Nenhum .fc-static-block encontrado. Nada para capturar.');
    return;
  }

  btn.addEventListener('click', async () => {
    try {
      if (typeof html2canvas !== 'function') {
        console.error('[dowglas-universe] html2canvas não está disponível. Confere se o script foi incluído antes de dowglas-universe.js.');
        return;
      }

      // Slug do arquivo (baseado no título da página)
      let slug = document.body.getAttribute('data-slug');
      if (!slug) {
        const rawTitle = document.title || 'dowglas-universe';
        slug = rawTitle
          .replace(/· Dowglas Universe/i, '') // tira o sufixo do layout
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')   // tira acentos
          .replace(/[^\w]+/g, '-')           // troca espaços/símbolos por hífen
          .replace(/^-+|-+$/g, '');          // limpa hífens nas pontas
      }
      slug = slug || 'dowglas-universe';

      console.log(`[dowglas-universe] iniciando captura de ${blocks.length} quadro(s)...`);

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        // Garante que o quadro está no centro da viewport
        block.scrollIntoView({ behavior: 'instant', block: 'center' });

        console.log(`[dowglas-universe] capturando quadro ${i + 1}/${blocks.length}...`);

        const canvas = await html2canvas(block, {
          scale: 2,          // mais nítido
          useCORS: true,     // ajuda com avatar/imagens externas
          backgroundColor: null
        });

        console.log(`[dowglas-universe] captura concluída para quadro ${i + 1}.`);

        const num = blocks.length > 1
          ? '-' + String(i + 1).padStart(2, '0')
          : '';

        const filename = `${slug}${num}.png`;

        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('[dowglas-universe] download iniciado:', filename);
      }
    } catch (error) {
      console.error('[dowglas-universe] erro ao gerar ou baixar imagem:', error);
    }
  });
});