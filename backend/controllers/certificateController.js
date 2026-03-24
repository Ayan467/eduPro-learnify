const Certificate = require('../models/Certificate');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// GET /api/certificates/my
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('course', 'title thumbnail');
    res.json({ success: true, certificates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/certificates/:id/download
const downloadCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    if (cert.student.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied' });

    // Generate PDF on the fly
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${cert.uniqueId}.pdf`);
    doc.pipe(res);

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f0f9ff');
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#1D9E75').lineWidth(3);

    // Header
    doc.font('Helvetica-Bold').fontSize(36).fillColor('#0F6E56')
       .text('EduPro', 0, 60, { align: 'center' });
    doc.font('Helvetica').fontSize(16).fillColor('#555')
       .text('Online Learning Platform', 0, 100, { align: 'center' });

    // Certificate Title
    doc.font('Helvetica-Bold').fontSize(28).fillColor('#1D9E75')
       .text('Certificate of Completion', 0, 150, { align: 'center' });

    // Body
    doc.font('Helvetica').fontSize(16).fillColor('#333')
       .text('This is to certify that', 0, 210, { align: 'center' });

    doc.font('Helvetica-Bold').fontSize(28).fillColor('#0F6E56')
       .text(cert.studentName, 0, 240, { align: 'center' });

    doc.font('Helvetica').fontSize(16).fillColor('#333')
       .text('has successfully completed the course', 0, 285, { align: 'center' });

    doc.font('Helvetica-Bold').fontSize(22).fillColor('#185FA5')
       .text(cert.courseName, 0, 315, { align: 'center' });

    doc.font('Helvetica').fontSize(14).fillColor('#555')
       .text(`Instructor: ${cert.instructorName}`, 0, 365, { align: 'center' });

    doc.font('Helvetica').fontSize(12).fillColor('#777')
       .text(`Completion Date: ${new Date(cert.completionDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 0, 390, { align: 'center' });

    doc.font('Helvetica').fontSize(10).fillColor('#aaa')
       .text(`Certificate ID: ${cert.uniqueId}`, 0, 420, { align: 'center' });

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyCertificates, downloadCertificate };
