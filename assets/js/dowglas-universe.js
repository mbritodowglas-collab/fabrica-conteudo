// assets/js/dowglas-universe.js
// Download em PNG para o layout "Dowglas Universe" (textão quadro único / multiquadros)

document.addEventListener('DOMContentLoaded', () => {
  // Botão fixo no topo (igual está no layout dowglas-universe.html)
  const btn =
    document.getElementById('download-universe') ||
    document.querySelector('[data-download="dowglas-universe"]');

  if (!btn) {
    console.warn('[dowglas-universe] Botão #download-universe não encontrado no DOM.');
    return;
  }

  // Blocos individuais (cada quadro do Universe)
  const blocks = Array.from(document.querySelectorAll('.fc-static-block'));

  // Fallback: se não houver .fc-static-block, tenta capturar o wrapper
  const wrapper =
    blocks.length === 0
      ? (document.querySelector('.fc-static-wrapper') ||
         document.querySelector('.du-slides'))
      : null;

  if (!blocks.length && !wrapper) {
    console.warn('[dowglas-universe] Nenhum .fc-static-block nem wrapper encontrado. Nada para capturar.');
    return;
  }

  console.log('[dowglas-universe] botão encontrado:', btn);
  console.log('[dowglas-universe] blocks encontrados:', blocks.length);
  if (wrapper) console.log('[dowglas-universe] wrapper (fallback) encontrado:', wrapper);

  btn.addEventListener('click', async () => {
    try {
      if (typeof html2canvas !== 'function') {
        console.error('[dowglas-universe] html2canvas não está disponível. Confere se o script foi incluído antes de dowglas-universe.js.');
        return;
      }

      // Gera um slug básico para nome do arquivo
      let slug = document.body.getAttribute('data-slug');
      if (!slug) {
        const rawTitle = document.title || 'dowglas-universe';
        slug = rawTitle
          // remove o sufixo padrão do layout
          .replace(/· Dowglas Universe/i, '')
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      slug = slug || 'dowglas-universe';

      // Caso principal: temos .fc-static-block (um ou vários)
      if (blocks.length) {
        console.log(`[dowglas-universe] iniciando captura de ${blocks.length} block(s)...`);

        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];

          // Garante que o bloco está visível e centralizado
          block.scrollIntoView({ behavior: 'auto', block: 'center' });

          console.log(`[dowglas-universe] capturando bloco ${i + 1}/${blocks.length}...`);

          const canvas = await html2canvas(block, {
            scale: 2,      // mais nítido
            useCORS: true, // ajuda com imagens/avatars externos
            backgroundColor: null
          });

          console.log(`[dowglas-universe] captura concluída para bloco ${i + 1}.`);

          // Se houver mais de um bloco, numera os arquivos
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

        return;
      }

      // Fallback: captura o wrapper inteiro em um único PNG
      if (wrapper) {
        console.log('[dowglas-universe] iniciando captura (fallback wrapper)...');

        wrapper.scrollIntoView({ behavior: 'auto', block: 'center' });

        const canvas = await html2canvas(wrapper, {
          scale: 2,
          useCORS: true
          // backgroundColor: null
        });

        console.log('[dowglas-universe] captura (wrapper) concluída.');

        const filename = `${slug}.png`;

        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('[dowglas-universe] download iniciado (wrapper):', filename);
      }

    } catch (error) {
      console.error('[dowglas-universe] erro ao gerar ou baixar imagem:', error);
    }
  });
});