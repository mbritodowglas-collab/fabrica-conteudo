/* Fábrica de Conteúdo · Modo Post Estático (commit-driven + entrada manual) */
'use strict';

/* ===========================
   CONFIGURAÇÃO DO REPOSITÓRIO
   ===========================

   Ajuste esses valores para o SEU repositório.
*/
const GITHUB_OWNER = 'SEU_USUARIO_AQUI';
const GITHUB_REPO = 'SEU_REPO_AQUI';
const GITHUB_BRANCH = 'main';
const STATIC_PATH = 'content/static';

// DOM
const staticTextarea = document.getElementById('static-input');
const staticBtn = document.getElementById('process-static');
const staticResultEl = document.getElementById('static-result');
const staticStatusEl = document.getElementById('static-status');

const staticFileListEl = document.getElementById('static-file-list');
const reloadStaticFilesBtn = document.getElementById('reload-static-files');
const staticFilesStatusEl = document.getElementById('static-files-status');

/* ========= helpers ========= */

function setStaticStatus(message, isError = false) {
  if (!staticStatusEl) return;
  staticStatusEl.textContent = message || '';
  staticStatusEl.style.color = isError ? '#ef5350' : '#a0a4b3';
}

function setStaticFilesStatus(message, isError = false) {
  if (!staticFilesStatusEl) return;
  staticFilesStatusEl.textContent = message || '';
  staticFilesStatusEl.style.color = isError ? '#ef5350' : '#a0a4b3';
}

function clearStaticResult() {
  if (staticResultEl) {
    staticResultEl.innerHTML = '';
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

async function loadStaticFiles() {
  if (!GITHUB_OWNER || !GITHUB_REPO) {
    setStaticFilesStatus('Configure GITHUB_OWNER e GITHUB_REPO em static.js.', true);
    return;
  }

  setStaticFilesStatus('Carregando arquivos do repositório...');
  if (staticFileListEl) staticFileListEl.innerHTML = '';

  try {
    const url = getGithubContentsUrl(STATIC_PATH);
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`GitHub API retornou ${resp.status}`);
    }

    const data = await resp.json();
    const files = (Array.isArray(data) ? data : []).filter(
      (item) => item.type === 'file' && item.name.toLowerCase().endsWith('.md')
    );

    if (!files.length) {
      setStaticFilesStatus('Nenhum arquivo .md encontrado em content/static.', true);
      return;
    }

    files.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    renderStaticFileList(files);
    setStaticFilesStatus(
      `Arquivos carregados: ${files.length}. Clique em um para gerar o card.`
    );
  } catch (err) {
    console.error(err);
    setStaticFilesStatus('Erro ao carregar arquivos do repositório. Verifique OWNER/REPO/PATH.', true);
  }
}

function renderStaticFileList(files) {
  if (!staticFileListEl) return;
  staticFileListEl.innerHTML = '';

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
    tag.textContent = 'Post estático .md';

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
      handleStaticFileClick(file.path, file.name);
    });

    staticFileListEl.appendChild(card);
  });
}

async function handleStaticFileClick(path, name) {
  clearStaticResult();
  setStaticStatus('');
  setStaticStatus(`Carregando "${name}" do repositório...`);

  try {
    const rawUrl = getGithubRawUrl(path);
    const resp = await fetch(rawUrl);
    if (!resp.ok) {
      throw new Error(`Raw retornou ${resp.status}`);
    }
    const raw = (await resp.text()).trim();

    if (staticTextarea) {
      staticTextarea.value = raw; // espelha na caixa (pra você ajustar se quiser)
    }

    const parsed = parseStaticMarkdown(raw);
    if (!parsed.texto && !parsed.nome && !parsed.handle && !parsed.meta) {
      setStaticStatus(
        'Nada identificado no arquivo. Confirme se usou "Nome:", "Handle:" e texto após uma linha em branco.',
        true
      );
      return;
    }

    const card = renderStaticCard(parsed);
    staticResultEl.appendChild(card);
    setStaticStatus(`Post processado a partir do arquivo: ${name}.`);
  } catch (err) {
    console.error(err);
    setStaticStatus('Erro ao carregar o arquivo do GitHub. Verifique branch e path.', true);
  }
}

/* ========= parsing de post estático ========= */

function parseStaticMarkdown(raw) {
  const lines = raw.split(/\r?\n/);
  let nome = '';
  let handle = '';
  let meta = '';
  const bodyLines = [];

  let inBody = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inBody) {
      const trimmed = line.trim();

      if (trimmed === '' || trimmed === '---') {
        inBody = true;
        continue;
      }

      const nomeMatch = trimmed.match(/^Nome\s*:\s*(.+)$/i);
      const handleMatch = trimmed.match(/^(Handle|@handle)\s*:\s*(.+)$/i);
      const metaMatch = trimmed.match(/^Meta\s*:\s*(.+)$/i);

      if (nomeMatch) {
        nome = nomeMatch[1].trim();
        continue;
      }
      if (handleMatch) {
        handle = handleMatch[2].trim();
        continue;
      }
      if (metaMatch) {
        meta = metaMatch[1].trim();
        continue;
      }

      if (!handle && /^@\S+/.test(trimmed)) {
        handle = trimmed;
        continue;
      }
    } else {
      bodyLines.push(line);
    }
  }

  const body = bodyLines.join('\n').trim();

  return {
    nome: nome || '',
    handle: handle || '',
    meta: meta || '',
    texto: body || '',
  };
}

function buildStaticClipboardText(parsed) {
  const headerParts = [];
  if (parsed.nome) headerParts.push(parsed.nome);
  if (parsed.handle) headerParts.push(parsed.handle);

  const lines = [];
  if (headerParts.length) {
    lines.push(headerParts.join(' · '));
    lines.push('');
  }

  if (parsed.texto) {
    lines.push(parsed.texto);
  }

  if (parsed.meta) {
    lines.push('');
    lines.push(parsed.meta);
  }

  return lines.join('\n').trim();
}

function renderStaticCard(parsed) {
  const card = document.createElement('article');
  card.className = 'card static-card';

  const header = document.createElement('div');
  header.className = 'card-header';

  const title = document.createElement('div');

  if (parsed.nome) {
    const nameEl = document.createElement('div');
    nameEl.className = 'static-name';
    nameEl.textContent = parsed.nome;
    title.appendChild(nameEl);
  }

  if (parsed.handle) {
    const handleEl = document.createElement('div');
    handleEl.className = 'static-handle';
    handleEl.textContent = parsed.handle;
    title.appendChild(handleEl);
  }

  header.appendChild(title);

  const tag = document.createElement('span');
  tag.className = 'card-tag';
  tag.textContent = 'Post Estático';
  header.appendChild(tag);

  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'card-body';

  if (parsed.texto) {
    const textEl = document.createElement('div');
    textEl.innerHTML = marked.parse(parsed.texto);
    body.appendChild(textEl);
  }

  if (parsed.meta) {
    const metaEl = document.createElement('div');
    metaEl.className = 'static-meta';
    metaEl.textContent = parsed.meta;
    body.appendChild(metaEl);
  }

  card.appendChild(body);

  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'btn btn-secondary';
  copyBtn.textContent = 'Copiar Conteúdo';

  const clipboardText = buildStaticClipboardText(parsed);
  copyBtn.addEventListener('click', () => {
    copyToClipboard(clipboardText, copyBtn);
  });

  footer.appendChild(copyBtn);
  card.appendChild(footer);

  return card;
}

/* ========= processamento manual ========= */

function processStaticManual() {
  const raw = (staticTextarea?.value || '').trim();
  clearStaticResult();
  setStaticStatus('');

  if (!raw) {
    setStaticStatus('Cole um conteúdo .md para processar o post.', true);
    return;
  }

  const parsed = parseStaticMarkdown(raw);

  if (!parsed.texto && !parsed.nome && !parsed.handle && !parsed.meta) {
    setStaticStatus(
      'Nada identificado. Confirme se usou "Nome:", "Handle:" e texto após uma linha em branco.',
      true
    );
    return;
  }

  const card = renderStaticCard(parsed);
  staticResultEl.appendChild(card);

  setStaticStatus('Post processado (entrada manual).');
}

/* ========= init ========= */

if (staticBtn) {
  staticBtn.addEventListener('click', processStaticManual);
}

if (reloadStaticFilesBtn) {
  reloadStaticFilesBtn.addEventListener('click', () => {
    loadStaticFiles();
  });
}

loadStaticFiles().catch(() => {});