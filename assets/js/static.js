// STÁTICO: lê um arquivo .md em /content, preenche o layout e exporta PNG

window.addEventListener('DOMContentLoaded', () => {
  const filenameInput = document.getElementById('static-filename');
  const btnLoad = document.getElementById('static-load');
  const btnDownload = document.getElementById('static-download');

  const nameEl = document.getElementById('static-name');
  const handleEl = document.getElementById('static-handle');
  const textEl = document.getElementById('static-text');
  const metaEl = document.getElementById('static-meta');
  const cardEl = document.getElementById('static-card');

  function parseStaticMd(md) {
    const lines = md.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');
    let handle = '@usuario';
    let nome = 'Nome da Conta';
    let texto = '';
    let meta = '';

    let currentBlock = null;

    for (const line of lines) {
      if (line.startsWith('@')) {
        handle = line;
        continue;
      }
      if (line.toLowerCase().startsWith('nome:')) {
        nome = line.replace(/nome:/i, '').trim() || nome;
        continue;
      }
      if (line.toLowerCase().startsWith('texto:')) {
        currentBlock = 'texto';
        continue;
      }
      if (line.toLowerCase().startsWith('meta:')) {
        currentBlock = 'meta';
        continue;
      }

      if (currentBlock === 'texto') {
        texto += (texto ? '\n' : '') + line;
      } else if (currentBlock === 'meta') {
        meta += (meta ? ' ' : '') + line;
      }
    }

    return { handle, nome, texto, meta };
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
      const { handle, nome, texto, meta } = parseStaticMd(md);

      nameEl.textContent = nome || 'Nome da Conta';
      handleEl.textContent = handle || '@usuario';
      textEl.textContent = texto || 'Texto não encontrado no arquivo .md.';
      metaEl.textContent = meta || 'Horário · Data · 0 curtidas · 0 comentários';

      btnDownload.disabled = false;
    } catch (err) {
      console.error(err);
      alert('Erro ao ler o arquivo .md. Veja o console para detalhes.');
    }
  });

  btnDownload.addEventListener('click', async () => {
    btnDownload.disabled = true;
    btnDownload.textContent = 'Gerando PNG...';

    try {
      const canvas = await html2canvas(cardEl, { scale: 2, backgroundColor: '#020617' });
      const link = document.createElement('a');
      link.download = 'post-estatico.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar imagem.');
    } finally {
      btnDownload.textContent = 'Baixar PNG';
      btnDownload.disabled = false;
    }
  });
});