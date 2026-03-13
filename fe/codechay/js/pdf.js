function exportToPDF(filename, title, head, body) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(title, 14, 14);
  doc.autoTable({
    head: [head],
    body,
    startY: 20,
  });
  doc.save(filename);
}
