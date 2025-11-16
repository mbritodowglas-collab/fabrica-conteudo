document.addEventListener("DOMContentLoaded", () => {
  const raw = document.getElementById("raw-md");
  const card = document.getElementById("fc-tweet-card");
  if (!raw || !card) return;

  const md = raw.textContent.trim().split(/\r?\n/);

  // Parser extremamente simples só para enxergar algo
  let handle = "@bellaprime";
  let nome = "Bella Prime";
  let texto = [];
  let meta = "";

  md.forEach(line => {
    if (line.startsWith("@")) {
      handle = line.trim();
    } else if (line.startsWith("Nome:")) {
      nome = line.replace("Nome:", "").trim();
    } else if (line.startsWith("Texto:")) {
      // ignora label, o resto do texto continua nas linhas seguintes
    } else if (line.startsWith("Meta:")) {
      meta = line.replace("Meta:", "").trim();
    } else {
      texto.push(line);
    }
  });

  const corpo = texto.join("\n").trim();

  card.innerHTML = `
    <div class="fc-tweet-header">
      <div class="fc-avatar"></div>
      <div>
        <div class="fc-tweet-name">${nome}</div>
        <div class="fc-tweet-handle">${handle}</div>
      </div>
    </div>
    <div class="fc-tweet-body">${corpo.replace(/\n/g, "<br>")}</div>
    <div class="fc-tweet-meta">${meta}</div>
  `;
});