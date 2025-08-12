const PDFDocument = require('pdfkit');
const QuickChart = require('quickchart-js');

async function crearGraficoBarras({ labels, values, label }) {
  const chart = new QuickChart();
  chart.setWidth(400);
  chart.setHeight(200);
  chart.setConfig({
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label,
          data: values,
          backgroundColor: ['#4e73df', '#1cc88a']
        }
      ]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
  return chart.toBinary();
}

async function generarPDFEvento({ evento, totalAsistentes, promedioAsistencia, grafico }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(18).text('Reporte de Evento', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Nombre: ${evento.nombre}`);
      doc.text(`Lugar: ${evento.lugar}`);
      if (evento.fechaInicio) doc.text(`Fecha Inicio: ${new Date(evento.fechaInicio).toLocaleString()}`);
      if (evento.fechaFin) doc.text(`Fecha Fin: ${new Date(evento.fechaFin).toLocaleString()}`);
      doc.moveDown();
      doc.text(`Total asistentes: ${totalAsistentes}`);
      doc.text(`Promedio de asistencia: ${promedioAsistencia.toFixed(2)}`);
      doc.moveDown();
      if (grafico) {
        doc.image(grafico, { fit: [500, 300], align: 'center' });
      }
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { crearGraficoBarras, generarPDFEvento };
