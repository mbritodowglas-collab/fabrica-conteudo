// assets/js/static.js
// Download em PNG para o "Post estático" (estilo Twitter)

document.addEventListener('DOMContentLoaded', () => {
  // Botão fixo no topo (igual está no layout)
  const btn =
    document.getElementById('download-static') ||
    document.querySelector('[data-download="static"]');

  if (!btn) {
    console.warn('[static] Botão #download-static não encontrado no DOM.');
    return;
  }

  // Wrapper principal que contém o card (hero, multi ou single)
  const wrapper =
    document.querySelector('.fc-static-wrapper') ||
    document.querySelector('.fc-static');

  if (!wrapper) {
    console.warn('[static] .fc-static-wrapper/.fc-static não encontrado. Nada para capturar.');
    return;
  }

  console.log('[static] wrapper encontrado:', wrapper);
  console.log('[static] botão encontrado:', btn);

  btn.addEventListener('click', async () => {
    try {
      if (typeof html2canvas !== 'function') {
        console.error('[static] html2canvas não está disponível. Confere se o script foi incluído antes de static.js.');
        return;
      }

      // Garante que o bloco está visível e centralizado na tela
      wrapper.scrollIntoView({ behavior: 'auto', block: 'center' });

      console.log('[static] iniciando captura com html2canvas...');

      const canvas = await html2canvas(wrapper, {
        scale: 2,      // mais nítido
        useCORS: true  // ajuda com imagens/avatars externos
        // backgroundColor: null // se quiser respeitar fundo transparente
      });

      console.log('[static] captura concluída.');

      // Gera um slug básico para nome do arquivo
      let slug = document.body.getAttribute('data-slug');
      if (!slug) {
        // fallback: usa o título da aba para gerar algo decente
        const rawTitle = document.title || 'post-estatico';
        slug = rawTitle
          .replace(/· Estático · Fábrica de Conteúdo/i, '')
          .trim()
          .toLowerCase()
          .replace(/[^\w]+/g, '-');
      }

      const filename = `${slug || 'post-estatico'}.png`;

      // Cria link de download e dispara
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('[static] download iniciado:', filename);
    } catch (error) {
      console.error('[static] erro ao gerar ou baixar imagem:', error);
    }
  });
});