/* Fábrica de Conteúdo · Modo Post Estático */
'use strict';

const staticTextarea = document.getElementById('static-input');
const staticBtn = document.getElementById('process-static');
const staticResultEl = document.getElementById('static-result');
const staticStatusEl = document.getElementById('static-status');

function setStaticStatus(message, isError = false) {
  if (!staticStatusEl) return;
  staticStatusEl.textContent = message || '';
  staticStatusEl.style.color = isError ? '#ef5350' : '#a0a4b3';
}

function clearStaticResult() {
  if (staticResultEl) {
    staticResultEl.innerHTML = '';
  }
}

function copyToClipboard(text, buttonEl) {
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
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
 * Parser simples para:
 * Nome: Fulana
 * Handle: @fulana
 * Meta: #tag1 #tag2
 * (linha em branco)
 * texto do post...
 */
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

      // linha vazia separa cabeçalho do texto
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

      // Se a linha começa com @ e não tem "Handle:", assume handle
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

/**
 * Monta o texto final para copiar (já alinhado à lógica de rede social).
 */
function buildStaticClipboardText(parsed) {
  const headerParts = [];
  if (parsed.nome) headerParts.push(parsed.nome);
  if (parsed.handle) headerParts.push(parsed.handle);

  const lines = [];
  if (headerParts.length) {
    lines.push(headerParts.join(' · '));
    lines.push(''); // linha em branco
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

/**
 * Cria o card DOM da prévia do post.
 */
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

function processStatic() {
  const raw = (staticTextarea?.value || '').trim();
  clearStaticResult();
  setStaticStatus('');

  if (!raw) {
    setStaticStatus('Cole um conteúdo .md para processar o post.', true);
    return;
  }

  const parsed = parseStaticMarkdown(raw);

  if (!parsed.texto && !parsed.nome && !parsed.handle && !parsed.meta) {
    setStaticStatus('Nada identificado. Confirme se usou "Nome:", "Handle:" e texto após uma linha em branco.', true);
    return;
  }

  const card = renderStaticCard(parsed);
  staticResultEl.appendChild(card);

  setStaticStatus('Post processado. Conteúdo pronto para copiar.');
}

if (staticBtn) {
  staticBtn.addEventListener('click', processStatic);
}