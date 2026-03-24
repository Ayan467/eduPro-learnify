// Certificate utility - PDF generation is handled in certificateController.js
// This file exists to prevent module not found errors
const generateCertificatePDF = (certData) => {
  // Actual PDF generation is in controllers/certificateController.js using PDFKit
  return null;
};

module.exports = { generateCertificatePDF };
