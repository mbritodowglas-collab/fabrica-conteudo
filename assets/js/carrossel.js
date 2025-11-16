// CARROSSEL: lê arquivo .md em /content, monta os slides no template e exporta PNG

window.addEventListener('DOMContentLoaded', () => {
  const filenameInput = document.getElementById('carousel-filename');
  const btnLoad = document.getElementById('carousel-load');
  const btnDownloadAll = document.getElementById('carousel-download-all');
  const slidesContainer = document.getElementById('carousel-slides');

  function parseCarouselMd(md) {
    const lines = md.split(/\r?\n/);
    let tituloGeral = '';
    let slides = [];

    let currentSlide = null;
    let currentBlock = null;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw.trim();

      if (!line) continue;

      // Título geral (# )
      if (line.startsWith('# ') && !line.startsWith('## ')) {
        tituloGeral = line.replace(/^#\s*/, '').trim();
        continue;
      }

      // Novo slide (## Slide X)
      if (line.toLowerCase().startsWith('## slide')) {
        if (currentSlide) slides.push(currentSlide);
        currentSlide = { label: line.replace(/^##\s*/i, '').trim(), hook: '', text: '', cta: '' };
        currentBlock = null;
        continue;
      }

      if (!currentSlide) continue;

      // Marcadores
      if (/^hook:/i.test(line)) {
        currentBlock = 'hook';
        continue;
      }
      if (/^texto:/i.test(line)) {
        currentBlock = 'text';
        continue;
      }
      if (/^cta:/i.test(line)) {
        currentBlock = 'cta';
        continue;
      }

      // Conteúdo
      if (currentBlock === 'hook') {
        currentSlide.hook += (currentSlide.hook ? '\n' : '') + line;
      } else if (currentBlock === 'text') {
        currentSlide.text += (currentSlide.text ? '\n' : '') + line;
      } else if (currentBlock === 'cta') {
        currentSlide.cta += (currentSlide.cta ? '\n' : '') + line;
      }
    }

    if (currentSlide) slides.push(currentSlide);
    return { tituloGeral, slides };
  }

  function createSlideCard(slide, index, tituloGeral) {
    const wrapper = document.createElement('div');
    wrapper.className = 'fc-slide-card';
    wrapper.id = `slide-card-${index + 1}`;

    const header = document.createElement('div');
    header.className = 'fc-slide-header';

    const label = document.createElement('div');
    label.className = 'fc-slide-label';
    label.textContent = slide.label || `Slide ${index + 1}`;

    const title = document.createElement('div');
    title.className = 'fc-slide-title';
    title.textContent = tituloGeral || 'Carrossel';

    header.appendChild(label);
    header.appendChild(title);

    const body = document.createElement('div');
    const hookEl = document.createElement('div');
    hookEl.className = 'fc-slide-hook';
    hookEl.textContent = slide.hook || '';

    const textEl = document.createElement('div');
    textEl.className = 'fc-slide-body';
    textEl.textContent = slide.text || '';

    const ctaEl = document.createElement('div');
    ctaEl.className = 'fc-slide-cta';
    ctaEl.textContent = slide.cta || '';

    if (slide.hook) body.appendChild(hookEl);
    if (slide.text) body.appendChild(textEl);
    if (slide.cta) body.appendChild(ctaEl);

    const actions = document.createElement('div');
    actions.className = 'fc-slide-actions';

    const btn = document.createElement('button');
    btn.className = 'fc-btn fc-btn-secondary';
    btn.textContent = `Baixar slide ${index + 1}`;
    btn.addEventListener('click', () => downloadSlide(wrapper, index + 1));

    actions.appendChild(btn);

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    wrapper.appendChild(actions);

    return wrapper;
  }

  async function downloadSlide(element, index) {
    const btn = element.querySelector('button');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Gerando...';

    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#020617' });
      const link = document.createElement('a');
      link.download = `carrossel-slide-${index}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar imagem do slide.');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  btnLoad.addEventListener('click', async () => {
    const filename = (filenameInput.value || '').trim();
    if (!filename) {
      alert('Informe o nome do arquivo .md que está em /content.');
      return;
    }

    try {
      const res = await fetch(`../content/${filename}`);
      if (!res.ok) {
        alert(`Não encontrei ../content/${filename}`);
        return;
      }
      const md = await res.text();
      const { tituloGeral, slides } = parseCarouselMd(md);

      if (!slides.length) {
        alert('Nenhum slide encontrado. Verifique se usou "## Slide X".');
        return;
      }

      slidesContainer.innerHTML = '';
      slides.forEach((slide, idx) => {
        const card = createSlideCard(slide, idx, tituloGeral);
        slidesContainer.appendChild(card);
      });

      btnDownloadAll.disabled = false;
    } catch (err) {
      console.error(err);
      alert('Erro ao ler o arquivo .md. Veja o console para detalhes.');
    }
  });

  btnDownloadAll.addEventListener('click', async () => {
    const cards = Array.from(slidesContainer.querySelectorAll('.fc-slide-card'));
    if (!cards.length) return;

    btnDownloadAll.disabled = true;
    btnDownloadAll.textContent = 'Gerando PNGs...';

    for (let i = 0; i < cards.length; i++) {
      await downloadSlide(cards[i], i + 1);
    }

    btnDownloadAll.textContent = 'Baixar todos os slides';
    btnDownloadAll.disabled = false;
  });
});