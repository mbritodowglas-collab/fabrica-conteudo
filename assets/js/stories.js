// assets/js/stories.js
document.addEventListener('DOMContentLoaded', () => {

  /* ===========================
     DOWNLOAD DOS STORIES// assets/js/stories.js
document.addEventListener('DOMContentLoaded', () => {

  /* ===========================
     DOWNLOAD DOS QUADROS STORY
     =========================== */
  const downloadBtn = document.getElementById('download-story');
  const frames = Array.from(document.querySelectorAll('.fc-story-frame'));

  if (downloadBtn && frames.length) {
    downloadBtn.addEventListener('click', async () => {
      const slug = (document.title || 'stories')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'stories';

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];

        frame.scrollIntoView({ behavior: 'instant', block: 'center' });

        const canvas = await html2canvas(frame, {
          scale: 2,
          useCORS: true,
          backgroundColor: null
        });

        const link = document.createElement('a');
        const num = String(i + 1).padStart(2, '0');

        link.download = `${slug}-story-${num}.png`;
        link.href = canvas.toDataURL('image/png');

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }

});

     =========================== */
  const downloadBtn = document.getElementById('download-story');
  const stories = Array.from(document.querySelectorAll('.fc-story'));

  if (downloadBtn && stories.length) {
    downloadBtn.addEventListener('click', async () => {
      // cria um slug a partir do título da página
      const slug = (document.title || 'stories')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'stories';

      for (let i = 0; i < stories.length; i++) {
        const story = stories[i];

        // garante que o quadro está no centro da tela
        story.scrollIntoView({ behavior: 'instant', block: 'center' });

        // captura o quadro em alta resolução
        const canvas = await html2canvas(story, {
          scale: 2,
          useCORS: true,
          backgroundColor: null
        });

        const link = document.createElement('a');
        const num = String(i + 1).padStart(2, '0');

        link.download = `${slug}-story-${num}.png`;
        link.href = canvas.toDataURL('image/png');

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }

});
