const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/profiles',
    'uploads/courses',
    'uploads/lessons',
    'uploads/pdfs',
    'uploads/videos',
    'uploads/certificates'
  ];
  
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

// Create upload directories on module load
createUploadDirs();

// File storage configuration
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on file usage
    let uploadPath = path.join(__dirname, '../uploads');
    
    // Check if the route contains a specific path indicator
    if (req.originalUrl.includes('profile') || req.originalUrl.includes('photo')) {
      uploadPath = path.join(__dirname, '../uploads/profiles');
    } else if (req.originalUrl.includes('course')) {
      uploadPath = path.join(__dirname, '../uploads/courses');
    } else if (req.originalUrl.includes('lesson') || req.originalUrl.includes('material')) {
      uploadPath = path.join(__dirname, '../uploads/lessons');
    } else if (req.originalUrl.includes('pdf')) {
      uploadPath = path.join(__dirname, '../uploads/pdfs');
    } else if (req.originalUrl.includes('video')) {
      uploadPath = path.join(__dirname, '../uploads/videos');
    } else if (req.originalUrl.includes('certificate')) {
      uploadPath = path.join(__dirname, '../uploads/certificates');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, hash) => {
      if (err) cb(err);
      const fileName = `${hash.toString('hex')}-${Date.now()}${path.extname(file.originalname)}`;
      cb(null, fileName);
    });
  }
});

// File filter function to control allowed file types
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    // Check if the file's mimetype is in our allowed types
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  };
};

// Allowed file types for different categories
const allowedTypes = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  videos: ['video/mp4', 'video/webm', 'video/ogg'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Mock function for cloud storage initialization
const initialize = async () => {
  console.log('Using local file storage instead of cloud storage');
  return true;
};

// Export multer configurations
module.exports = {
  // Initialize function (mock)
  initialize,
  
  // Upload configurations for different file types
  upload: {
    profileImage: multer({
      storage: diskStorage,
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
      fileFilter: fileFilter(allowedTypes.images)
    }),
    
    courseImage: multer({
      storage: diskStorage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: fileFilter(allowedTypes.images)
    }),
    
    lessonMaterial: multer({
      storage: diskStorage,
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
      fileFilter: fileFilter(allowedTypes.all)
    }),
    
    pdf: multer({
      storage: diskStorage,
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
      fileFilter: fileFilter(allowedTypes.documents)
    }),
    
    video: multer({
      storage: diskStorage,
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
      fileFilter: fileFilter(allowedTypes.videos)
    }),
    
    certificate: multer({
      storage: diskStorage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: fileFilter(allowedTypes.images.concat(['application/pdf']))
    })
  },
  
  // Function to delete a file
  deleteFile: async (filePath) => {
    try {
      // Extract the filename from URL or path
      const filename = filePath.split('/').pop();
      
      // Check in different upload directories
      const possiblePaths = [
        path.join(__dirname, '../uploads', filename),
        path.join(__dirname, '../uploads/profiles', filename),
        path.join(__dirname, '../uploads/courses', filename),
        path.join(__dirname, '../uploads/lessons', filename),
        path.join(__dirname, '../uploads/pdfs', filename),
        path.join(__dirname, '../uploads/videos', filename),
        path.join(__dirname, '../uploads/certificates', filename)
      ];
      
      for (const potentialPath of possiblePaths) {
        if (fs.existsSync(potentialPath)) {
          fs.unlinkSync(potentialPath);
          console.log(`Deleted file: ${potentialPath}`);
          return true;
        }
      }
      
      console.warn(`File not found for deletion: ${filePath}`);
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
};