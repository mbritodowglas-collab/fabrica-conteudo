// assets/js/stories.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('[stories] stories.js carregado');

  // Botão de download (id do layout)
  const downloadBtn = document.getElementById('download-stories');
  if (!downloadBtn) {
    console.warn('[stories] Botão #download-stories não encontrado.');
    return;
  }

  // Cada STORY é um .fc-slide (como no layout)
  const frames = Array.from(document.querySelectorAll('.fc-slide'));

  if (!frames.length) {
    console.warn('[stories] Nenhum .fc-slide encontrado na página.');
    return;
  }

  downloadBtn.addEventListener('click', async () => {
    console.log('[stories] Clique no botão. Quadros encontrados:', frames.length);

    // slug a partir do título da página
    const slug = (document.title || 'stories')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'stories';

    const originalLabel = downloadBtn.textContent;
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Gerando...';

    try {
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];

        // garante que o quadro está visível
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
      alert('Rolou um erro ao gerar os stories. Abre o console pra ver o detalhe.');
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.textContent = originalLabel;
    }
  });
});