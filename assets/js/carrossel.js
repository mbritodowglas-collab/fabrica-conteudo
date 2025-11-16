/* Fábrica de Conteúdo · Modo Carrossel */
'use strict';

const textarea = document.getElementById('carrossel-input');
const processBtn = document.getElementById('process-carrossel');
const resultsEl = document.getElementById('carrossel-results');
const statusEl = document.getElementById('carrossel-status');

const BASE_IMAGE_PROMPT =
  'Mulher treinando em academia, paleta vermelho/preto, estética Bella Prime, ' +
  'expressão focada, iluminação dramática, estilo realismo estilizado.';

function setStatus(message, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = message || '';
  statusEl.style.color = isError ? '#ef5350' : '#a0a4b3';
}

function clearResults() {
  if (resultsEl) {
    resultsEl.innerHTML = '';
  }
}

function copyToClipboard(text, buttonEl) {
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    // Fallback simples
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Falha ao copiar (fallback):', err);
    }
    document.body.removeChild(textarea);
    if (buttonEl) {
      const original = buttonEl.textContent;
      buttonEl.textContent = 'Copiado!';
      setTimeout(() => (buttonEl.textContent = original), 1200);
    }
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => {
      if (buttonEl) {
        const original = buttonEl.textContent;
        buttonEl.textContent = 'Copiado!';
        setTimeout(() => (buttonEl.textContent = original), 1200);
      }
    })
    .catch((err) => {
      console.error('Erro ao copiar:', err);
    });
}

/**
 * Divide o markdown em blocos de slides baseado em headings "## Slide X".
 * Cada bloco inclui o título.
 */
function splitIntoSlides(raw) {
  const slides = [];
  const regex = /(^##\s+.+$[\s\S]*?)(?=^##\s+.+$|\Z)/gm;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const block = match[1].trim();
    if (block) {
      slides.push(block);
    }
  }
  return slides;
}

/**
 * Extrai título ("Slide 1" etc) e conteúdo do bloco.
 */
function extractTitleAndBody(block) {
  let title = 'Slide';
  const titleMatch = block.match(/^##\s+(.+)$/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }
  const body = block.replace(/^##\s+.+$/m, '').trim();
  return { title, body };
}

/**
 * Dentro do corpo do slide, detecta HOOK, TEXTO e CTA.
 * Suporta linhas começando com:
 *   "HOOK:", "TEXTO:", "CTA:"
 * Se nada for marcado, todo o bloco vira TEXTO.
 */
function parseSections(body) {
  const lines = body.split(/\r?\n/);
  let currentSection = null;
  const sections = {
    hook: [],
    text: [],
    cta: [],
  };

  const setSectionFromLabel = (line) => {
    const trimmed = line.trim();
    const match = trimmed.match(/^([A-Za-zçÇ]+)\s*:/);
    if (!match) return null;

    const label = match[1].toLowerCase();
    let sectionKey = null;
    if (label.startsWith('hook')) sectionKey = 'hook';
    else if (label.startsWith('texto') || label === 'text') sectionKey = 'text';
    else if (label === 'cta') sectionKey = 'cta';

    return sectionKey;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const maybeSection = setSectionFromLabel(line);
    if (maybeSection) {
      currentSection = maybeSection;
      // remove "LABEL:" do início e guarda o resto da linha (se houver)
      const content = line.replace(/^([A-Za-zçÇ]+)\s*:/, '').trim();
      if (content) {
        sections[currentSection].push(content);
      }
      continue;
    }

    if (!currentSection) {
      // Se nenhuma seção ainda foi definida, acumula em TEXTO por padrão
      sections.text.push(line);
    } else {
      sections[currentSection].push(line);
    }
  }

  const hook = sections.hook.join('\n').trim();
  const text = sections.text.join('\n').trim();
  const cta = sections.cta.join('\n').trim();

  return { hook, text, cta };
}

/**
 * Monta o texto bruto do slide para copiar.
 */
function buildSlideClipboardText(parsed) {
  const parts = [];
  if (parsed.hook) parts.push(parsed.hook);
  if (parsed.text) parts.push(parsed.text);
  if (parsed.cta) parts.push(parsed.cta);
  return parts.join('\n\n').trim();
}

/**
 * Cria o card DOM para cada slide.
 */
function renderSlideCard(index, title, parsed) {
  const card = document.createElement('article');
  card.className = 'card slide-card';

  const header = document.createElement('div');
  header.className = 'card-header';

  const h3 = document.createElement('h3');
  h3.className = 'card-title';
  h3.textContent = title || `Slide ${index + 1}`;

  const tag = document.createElement('span');
  tag.className = 'card-tag';
  tag.textContent = `Slide ${index + 1}`;

  header.appendChild(h3);
  header.appendChild(tag);
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'card-body';

  if (parsed.hook) {
    const label = document.createElement('div');
    label.className = 'card-section-label';
    label.textContent = 'HOOK';
    body.appendChild(label);

    const hookEl = document.createElement('div');
    hookEl.innerHTML = marked.parse(parsed.hook);
    body.appendChild(hookEl);
  }

  if (parsed.text) {
    const label = document.createElement('div');
    label.className = 'card-section-label';
    label.textContent = 'TEXTO';
    body.appendChild(label);

    const textEl = document.createElement('div');
    textEl.innerHTML = marked.parse(parsed.text);
    body.appendChild(textEl);
  }

  if (parsed.cta) {
    const label = document.createElement('div');
    label.className = 'card-section-label';
    label.textContent = 'CTA';
    body.appendChild(label);

    const ctaEl = document.createElement('div');
    ctaEl.innerHTML = marked.parse(parsed.cta);
    body.appendChild(ctaEl);
  }

  card.appendChild(body);

  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const copySlideBtn = document.createElement('button');
  copySlideBtn.className = 'btn btn-secondary';
  copySlideBtn.type = 'button';
  copySlideBtn.textContent = 'Copiar Slide';

  const copyPromptBtn = document.createElement('button');
  copyPromptBtn.className = 'btn btn-secondary';
  copyPromptBtn.type = 'button';
  copyPromptBtn.textContent = 'Copiar Prompt para Imagem';

  const clipboardText = buildSlideClipboardText(parsed);

  copySlideBtn.addEventListener('click', () => {
    copyToClipboard(clipboardText, copySlideBtn);
  });

  copyPromptBtn.addEventListener('click', () => {
    const fullPrompt = `${BASE_IMAGE_PROMPT} (referência: ${title || `Slide ${index + 1}`}).`;
    copyToClipboard(fullPrompt, copyPromptBtn);
  });

  footer.appendChild(copySlideBtn);
  footer.appendChild(copyPromptBtn);

  card.appendChild(footer);

  return card;
}

function processCarrossel() {
  const raw = (textarea?.value || '').trim();
  clearResults();
  setStatus('');

  if (!raw) {
    setStatus('Cole um conteúdo .md para processar o carrossel.', true);
    return;
  }

  const slides = splitIntoSlides(raw);
  if (!slides.length) {
    setStatus('Nenhum slide encontrado. Use headings como "## Slide 1", "## Slide 2"...', true);
    return;
  }

  slides.forEach((block, index) => {
    const { title, body } = extractTitleAndBody(block);
    const parsed = parseSections(body);
    const card = renderSlideCard(index, title, parsed);
    resultsEl.appendChild(card);
  });

  setStatus(`Processado: ${slides.length} slide(s) gerado(s).`);
}

if (processBtn) {
  processBtn.addEventListener('click', processCarrossel);
}