// Export configuration variables
module.exports = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    
    // MongoDB connection
    mongoUri: process.env.MONGO_URI,
    
    // JWT settings
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRE,
      cookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE) || 30
    },
    
    // Email settings
    email: {
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      from: process.env.EMAIL_FROM
    },
    
    // AWS S3 settings
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucketName: process.env.AWS_BUCKET_NAME,
      region: process.env.AWS_REGION
    }
  };