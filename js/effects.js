window.startEffects = function startEffects() {
  const rain = document.getElementById("matrix-rain");
  const chars = "01[]{}<>/\\#?NIGHTGLASS";

  function renderRain() {
    const width = Math.floor(window.innerWidth / 12);
    const lines = [];
    for (let i = 0; i < 26; i += 1) {
      let row = "";
      for (let j = 0; j < width; j += 1) {
        row += chars[Math.floor(Math.random() * chars.length)];
      }
      lines.push(row);
    }
    rain.textContent = lines.join("\n");
  }

  setInterval(renderRain, 800);
  renderRain();

  setInterval(() => {
    if (Math.random() < 0.12) {
      document.body.classList.add("glitch");
      setTimeout(() => document.body.classList.remove("glitch"), 350);
    }
  }, 2600);
};

window.alertFlash = function alertFlash() {
  document.body.classList.add("flash-alert");
  setTimeout(() => document.body.classList.remove("flash-alert"), 600);
};
