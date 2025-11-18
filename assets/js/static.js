// assets/js/static.js
// Download em PNG para o "Post estático" (estilo Twitter / post único ou múltiplos cards)

document.addEventListener('DOMContentLoaded', () => {
  // Botão fixo no topo (igual está no layout)
  const btn =
    document.getElementById('download-static') ||
    document.querySelector('[data-download="static"]');

  if (!btn) {
    console.warn('[static] Botão #download-static não encontrado no DOM.');
    return;
  }

  // Blocos individuais de card estático (hero, single ou multi-card)
  const blocks = Array.from(document.querySelectorAll('.fc-static-block'));

  // Fallback antigo: se por algum motivo não houver .fc-static-block,
  // tentamos capturar o wrapper inteiro (comportamento legacy).
  const wrapper =
    blocks.length === 0
      ? (document.querySelector('.fc-static-wrapper') ||
         document.querySelector('.fc-static'))
      : null;

  if (!blocks.length && !wrapper) {
    console.warn('[static] Nenhum .fc-static-block nem .fc-static-wrapper encontrado. Nada para capturar.');
    return;
  }

  console.log('[static] botão encontrado:', btn);
  console.log('[static] blocks encontrados:', blocks.length);
  if (wrapper) console.log('[static] wrapper (fallback) encontrado:', wrapper);

  btn.addEventListener('click', async () => {
    try {
      if (typeof html2canvas !== 'function') {
        console.error('[static] html2canvas não está disponível. Confere se o script foi incluído antes de static.js.');
        return;
      }

      // Gera um slug básico para nome do arquivo
      let slug = document.body.getAttribute('data-slug');
      if (!slug) {
        const rawTitle = document.title || 'post-estatico';
        slug = rawTitle
          .replace(/· Estático · Fábrica de Conteúdo/i, '')
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      slug = slug || 'post-estatico';

      // Caso novo: temos .fc-static-block (um ou vários)
      if (blocks.length) {
        console.log(`[static] iniciando captura de ${blocks.length} block(s)...`);

        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];

          // Garante que o bloco está visível e centralizado na tela
          block.scrollIntoView({ behavior: 'auto', block: 'center' });

          console.log(`[static] capturando bloco ${i + 1}/${blocks.length}...`);

          const canvas = await html2canvas(block, {
            scale: 2,      // mais nítido
            useCORS: true, // ajuda com imagens/avatars externos
            backgroundColor: null
          });

          console.log(`[static] captura concluída para bloco ${i + 1}.`);

          // Se houver mais de um bloco, enumeramos nos arquivos
          const num = blocks.length > 1
            ? '-' + String(i + 1).padStart(2, '0')
            : '';

          const filename = `${slug}${num}.png`;

          // Cria link de download e dispara
          const link = document.createElement('a');
          link.download = filename;
          link.href = canvas.toDataURL('image/png');

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          console.log('[static] download iniciado:', filename);
        }

        return;
      }

      // Fallback legacy: captura o wrapper inteiro em um único PNG
      if (wrapper) {
        console.log('[static] iniciando captura (fallback wrapper)...');

        wrapper.scrollIntoView({ behavior: 'auto', block: 'center' });

        const canvas = await html2canvas(wrapper, {
          scale: 2,
          useCORS: true
          // backgroundColor: null // habilita se quiser respeitar transparência
        });

        console.log('[static] captura (wrapper) concluída.');

        const filename = `${slug}.png`;

        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('[static] download iniciado (wrapper):', filename);
      }

    } catch (error) {
      console.error('[static] erro ao gerar ou baixar imagem:', error);
    }
  });
});