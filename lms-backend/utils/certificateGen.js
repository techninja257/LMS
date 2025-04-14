const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a course completion certificate
 * @param {Object} data - Certificate data
 * @param {string} data.userName - User's full name
 * @param {string} data.courseName - Course name
 * @param {string} data.completionDate - Formatted completion date
 * @param {string} data.userId - User ID
 * @param {string} data.courseId - Course ID
 * @returns {Promise<string>} - Local path of the generated certificate
 */
const generateCertificate = async (data) => {
  // Create uploads/certificates directory if it doesn't exist
  const certificatesDir = path.join(__dirname, '../uploads/certificates');
  if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir, { recursive: true });
  }
  
  // Create a filename
  const filename = `certificate-${data.userId}-${data.courseId}-${uuidv4()}.pdf`;
  const filePath = path.join(certificatesDir, filename);
  
  // Generate PDF certificate
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 72, right: 72 }
      });
      
      // Pipe the PDF into a file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Set up the certificate
      doc.font('Helvetica-Bold')
        .fontSize(30)
        .text('CERTIFICATE OF COMPLETION', { align: 'center' });
      
      doc.moveDown();
      doc.font('Helvetica')
        .fontSize(16)
        .text('This is to certify that', { align: 'center' });
      
      doc.moveDown();
      doc.font('Helvetica-Bold')
        .fontSize(24)
        .text(data.userName, { align: 'center' });
      
      doc.moveDown();
      doc.font('Helvetica')
        .fontSize(16)
        .text('has successfully completed the course', { align: 'center' });
      
      doc.moveDown();
      doc.font('Helvetica-Bold')
        .fontSize(24)
        .text(data.courseName, { align: 'center' });
      
      doc.moveDown();
      doc.font('Helvetica')
        .fontSize(16)
        .text(`on ${data.completionDate}`, { align: 'center' });
      
      // Add a border
      doc.lineWidth(3)
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .stroke();
      
      // Add certificate ID
      doc.font('Helvetica')
        .fontSize(10)
        .text(`Certificate ID: ${uuidv4()}`, doc.page.width - 250, doc.page.height - 70);
      
      // Finalize the PDF
      doc.end();
      
      // When the stream is closed, return the file path
      stream.on('close', async () => {
        try {
          // Return the relative path to the certificate file
          const relativePath = `/uploads/certificates/${filename}`;
          resolve(relativePath);
        } catch (err) {
          reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateCertificate;