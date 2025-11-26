// assets/js/stories.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('[stories] script stories.js carregado');

  // Botão de download
  const downloadBtn = document.getElementById('download-story');
  if (!downloadBtn) {
    console.warn('[stories] Botão #download-story não encontrado.');
    return;
  }

  // Quadros de story: tenta primeiro .fc-story-frame, depois .fc-story
  let frames = Array.from(document.querySelectorAll('.fc-story-frame'));
  if (!frames.length) {
    frames = Array.from(document.querySelectorAll('.fc-story'));
  }

  if (!frames.length) {
    console.warn('[stories] Nenhum quadro encontrado (.fc-story-frame ou .fc-story).');
    return;
  }

  downloadBtn.addEventListener('click', async () => {
    console.log('[stories] Clique no botão de download. Quadros encontrados:', frames.length);

    // gera slug a partir do título
    const slug = (document.title || 'stories')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'stories';

    // feedback visual no botão
    const originalLabel = downloadBtn.textContent;
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Gerando...';

    try {
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];

        // garante que o quadro atual esteja visível
        frame.scrollIntoView({ behavior: 'auto', block: 'center' });

        // captura em alta resolução
        const canvas = await html2canvas(frame, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          scrollX: 0,
          scrollY: -window.scrollY
        });

        const link = document.createElement('a');
        const num = String(i + 1).padStart(2, '0');

        link.download = `${slug}-story-${num}.png`;
        link.href = canvas.toDataURL('image/png');

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`[stories] Download gerado: ${slug}-story-${num}.png`);
      }
    } catch (err) {
      console.error('[stories] Erro ao gerar stories:', err);
      alert('Rolou um erro ao gerar o stories. Abre o console pra ver o detalhe.');
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.textContent = originalLabel;
    }
  });
});