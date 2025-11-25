document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("download-story");
  if (!btn) return;

  btn.addEventListener("click", async function () {
    const cards = Array.from(document.querySelectorAll(".fc-story-card"));
    if (!cards.length) return;

    // Desliga o botão enquanto exporta
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "Gerando PNG...";

    const title = document.title || "story";

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      // Garante que o card esteja visível na tela (se tiver scroll)
      card.scrollIntoView({ behavior: "auto", block: "center" });

      // Pequeno delay pra garantir render ok
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r => setTimeout(r, 150));

      // Captura com html2canvas
      // eslint-disable-next-line no-await-in-loop
      const canvas = await html2canvas(card, {
        useCORS: true,
        scale: 2 // melhora a definição
      });

      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const index = (i + 1).toString().padStart(2, "0");

      link.href = dataURL;
      link.download = `${slugify(title)}-story-${index}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    btn.textContent = originalText;
    btn.disabled = false;
  });

  // Função simples pra criar slug a partir do título
  function slugify(str) {
    return (str || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // tira acentos
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
});
