/* Fábrica de Conteúdo · Modo Carrossel (commit-driven + entrada manual) */
'use strict';

/* ===========================
   CONFIGURAÇÃO DO REPOSITÓRIO
   ===========================

   Ajuste esses valores para o SEU repositório.
   Exemplo:
   - OWNER: "mdpersonal"
   - REPO: "fabrica-conteudo"
   - BRANCH: "main"
*/
const GITHUB_OWNER = 'SEU_USUARIO_AQUI';
const GITHUB_REPO = 'SEU_REPO_AQUI';
const GITHUB_BRANCH = 'main';
const CARROSSEL_PATH = 'content/carrossel';

const BASE_IMAGE_PROMPT =
  'Mulher treinando em academia, paleta vermelho/preto, estética Bella Prime, ' +
  'expressão focada, iluminação dramática, estilo realismo estilizado.';

// DOM
const textarea = document.getElementById('carrossel-input');
const processBtn = document.getElementById('process-carrossel');
const resultsEl = document.getElementById('carrossel-results');
const statusEl = document.getElementById('carrossel-status');

const fileListEl = document.getElementById('carrossel-file-list');
const reloadFilesBtn = document.getElementById('reload-carrossel-files');
const filesStatusEl = document.getElementById('carrossel-files-status');

/* ========= helpers genéricos ========= */

function setStatus(message, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = message || '';
  statusEl.style.color = isError ? '#ef5350' : '#a0a4b3';
}

function setFilesStatus(message, isError = false) {
  if (!filesStatusEl) return;
  filesStatusEl.textContent = message || '';
  filesStatusEl.style.color = isError ? '#ef5350' : '#a0a4b3';
}

function clearResults() {
  if (resultsEl) {
    resultsEl.innerHTML = '';
  }
}

function copyToClipboard(text, buttonEl) {
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Falha ao copiar (fallback):', err);
    }
    document.body.removeChild(ta);
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

/* ========= helpers GitHub API ========= */

function getGithubContentsUrl(path) {
  return `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(
    path
  )}`;
}

function getGithubRawUrl(path) {
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
}

async function loadCarrosselFiles() {
  if (!GITHUB_OWNER || !GITHUB_REPO) {
    setFilesStatus('Configure GITHUB_OWNER e GITHUB_REPO em carrossel.js.', true);
    return;
  }

  setFilesStatus('Carregando arquivos do repositório...');
  if (fileListEl) fileListEl.innerHTML = '';

  try {
    const url = getGithubContentsUrl(CARROSSEL_PATH);
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`GitHub API retornou ${resp.status}`);
    }

    const data = await resp.json();
    const files = (Array.isArray(data) ? data : []).filter(
      (item) => item.type === 'file' && item.name.toLowerCase().endsWith('.md')
    );

    if (!files.length) {
      setFilesStatus('Nenhum arquivo .md encontrado em content/carrossel.', true);
      return;
    }

    // Ordena por nome
    files.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    renderCarrosselFileList(files);
    setFilesStatus(`Arquivos carregados: ${files.length}. Clique em um para gerar os slides.`);
  } catch (err) {
    console.error(err);
    setFilesStatus('Erro ao carregar arquivos do repositório. Verifique OWNER/REPO/PATH.', true);
  }
}

function renderCarrosselFileList(files) {
  if (!fileListEl) return;
  fileListEl.innerHTML = '';

  files.forEach((file) => {
    const card = document.createElement('article');
    card.className = 'card file-card';
    card.dataset.path = file.path;

    const header = document.createElement('div');
    header.className = 'card-header';

    const title = document.createElement('h3');
    title.className = 'card-title file-name';
    title.textContent = file.name;

    const tag = document.createElement('span');
    tag.className = 'card-tag';
    tag.textContent = 'Carrossel .md';

    header.appendChild(title);
    header.appendChild(tag);
    card.appendChild(header);

    const body = document.createElement('div');
    body.className = 'card-body';

    const meta = document.createElement('div');
    meta.className = 'file-meta';
    meta.textContent = file.path;
    body.appendChild(meta);

    card.appendChild(body);

    card.addEventListener('click', () => {
      handleCarrosselFileClick(file.path, file.name);
    });

    fileListEl.appendChild(card);
  });
}

async function handleCarrosselFileClick(path, name) {
  clearResults();
  setStatus('');
  setStatus(`Carregando "${name}" do repositório...`);

  try {
    const rawUrl = getGithubRawUrl(path);
    const resp = await fetch(rawUrl);
    if (!resp.ok) {
      throw new Error(`Raw retornou ${resp.status}`);
    }
    const raw = (await resp.text()).trim();

    if (textarea) {
      textarea.value = raw; // opcional: espelhar na caixa
    }

    processCarrosselFromText(raw, `arquivo: ${name}`);
  } catch (err) {
    console.error(err);
    setStatus('Erro ao carregar o arquivo do GitHub. Verifique branch e path.', true);
  }
}

/* ========= parsing de slides (igual antes) ========= */

function splitIntoSlides(raw) {
  const slides = [];
  const regex = /(^##\s+.+$[\s\S]*?)(?=^##\s+.+$|\Z)/gm;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const block = match[1].trim();
    if (block) slides.push(block);
  }
  return slides;
}

function extractTitleAndBody(block) {
  let title = 'Slide';
  const titleMatch = block.match(/^##\s+(.+)$/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }
  const body = block.replace(/^##\s+.+$/m, '').trim();
  return { title, body };
}

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
      const content = line.replace(/^([A-Za-zçÇ]+)\s*:/, '').trim();
      if (content) sections[currentSection].push(content);
      continue;
    }

    if (!currentSection) {
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

function buildSlideClipboardText(parsed) {
  const parts = [];
  if (parsed.hook) parts.push(parsed.hook);
  if (parsed.text) parts.push(parsed.text);
  if (parsed.cta) parts.push(parsed.cta);
  return parts.join('\n\n').trim();
}

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

/* ========= processamento principal ========= */

function processCarrosselFromText(raw, origemLabel) {
  const trimmed = (raw || '').trim();
  clearResults();
  if (!trimmed) {
    setStatus('Nenhum conteúdo para processar.', true);
    return;
  }

  const slides = splitIntoSlides(trimmed);
  if (!slides.length) {
    setStatus(
      'Nenhum slide encontrado. Use headings como "## Slide 1", "## Slide 2"...',
      true
    );
    return;
  }

  slides.forEach((block, index) => {
    const { title, body } = extractTitleAndBody(block);
    const parsed = parseSections(body);
    const card = renderSlideCard(index, title, parsed);
    resultsEl.appendChild(card);
  });

  setStatus(`Processado: ${slides.length} slide(s) gerado(s) (${origemLabel}).`);
}

function processCarrosselManual() {
  const raw = textarea ? textarea.value : '';
  if (!raw.trim()) {
    setStatus('Cole um conteúdo .md para processar o carrossel.', true);
    return;
  }
  processCarrosselFromText(raw, 'entrada manual');
}

/* ========= init ========= */

if (processBtn) {
  processBtn.addEventListener('click', processCarrosselManual);
}

if (reloadFilesBtn) {
  reloadFilesBtn.addEventListener('click', () => {
    loadCarrosselFiles();
  });
}

// Carrega automaticamente a lista na abertura da página
loadCarrosselFiles().catch(() => {});