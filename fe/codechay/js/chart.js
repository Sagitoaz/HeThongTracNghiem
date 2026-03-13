function drawHistogram(canvas, scores) {
  const ctx = canvas.getContext("2d");
  const w = (canvas.width = canvas.clientWidth);
  const h = (canvas.height = 180);
  const bins = [0, 0, 0, 0, 0];
  scores.forEach((s) => {
    if (s < 2) bins[0]++;
    else if (s < 4) bins[1]++;
    else if (s < 6) bins[2]++;
    else if (s < 8) bins[3]++;
    else bins[4]++;
  });
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.moveTo(40, 10);
  ctx.lineTo(40, h - 30);
  ctx.lineTo(w - 10, h - 30);
  ctx.stroke();
  const maxV = Math.max(1, ...bins);
  const barW = (w - 60) / bins.length;
  const labels = ["0-2", "2-4", "4-6", "6-8", "8-10"];
  for (let i = 0; i < bins.length; i++) {
    const x = 45 + i * barW;
    const barH = (h - 60) * (bins[i] / maxV);
    const y = h - 30 - barH;
    ctx.fillStyle = "#c8102e";
    ctx.fillRect(x, y, barW - 10, barH);
    ctx.fillStyle = "#6b7280";
    ctx.font = "12px system-ui";
    ctx.fillText(labels[i], x, h - 12);
    ctx.fillStyle = "#111827";
    ctx.fillText(String(bins[i]), x, y - 6);
  }
}
