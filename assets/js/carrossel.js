document.addEventListener("DOMContentLoaded", () => {
  const raw = document.getElementById("raw-md");
  const slidesRoot = document.getElementById("fc-slides");
  if (!raw || !slidesRoot) return;

  const md = raw.textContent.trim();

  // Por enquanto, só cria 1 slide genérico
  const slide = document.createElement("div");
  slide.className = "fc-slide-card";
  slide.innerHTML = `
    <div>
      <div class="fc-slide-label">Prévia</div>
      <div class="fc-slide-title">${document.title}</div>
      <div class="fc-slide-body">
        Este é apenas um placeholder. O conteúdo bruto tem
        <strong>${md.length}</strong> caracteres.
        <br><br>
        Próxima etapa: quebrar o .md em slides (## Slide X)
        e montar cada card com HOOK / TEXTO / CTA.
      </div>
    </div>
  `;

  slidesRoot.appendChild(slide);
});