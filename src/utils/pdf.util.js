const PDFDocument = require('pdfkit');

async function generateEventPDFBase64(evento, dashboardMetrics = [], eventMetrics = null) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer.toString('base64'));
      });

      doc.fontSize(18).text('Reporte de Evento', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Nombre: ${evento.nombre}`);
      doc.text(`Tipo: ${evento.tipo}`);
      if (evento.fechaInicio) doc.text(`Fecha Inicio: ${new Date(evento.fechaInicio).toLocaleString()}`);
      if (evento.fechaFin) doc.text(`Fecha Fin: ${new Date(evento.fechaFin).toLocaleString()}`);
      if (evento.horaInicio) doc.text(`Hora Inicio: ${evento.horaInicio}`);
      if (evento.horaFin) doc.text(`Hora Fin: ${evento.horaFin}`);
      doc.text(`Lugar: ${evento.lugar}`);
      if (evento.descripcion) doc.text(`Descripcion: ${evento.descripcion}`);
      doc.moveDown();


        doc.text('Métricas Dashboard:', { underline: true });
        dashboardMetrics.forEach(m => {
          doc.text(`${m.metric}: ${m.value}`);
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateEventPDFBase64 };
