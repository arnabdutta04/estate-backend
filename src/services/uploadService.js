const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload single file to Cloudinary
exports.uploadToCloudinary = async (fileBuffer, folder = 'estate', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        transformation: [
          { width: 1000, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    // Create readable stream from buffer
    const bufferStream = Readable.from(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

// Upload multiple files to Cloudinary
exports.uploadMultipleToCloudinary = async (files, folder = 'estate') => {
  const uploadPromises = files.map(file => 
    this.uploadToCloudinary(file.buffer, folder)
  );
  
  return await Promise.all(uploadPromises);
};

// Delete file from Cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Upload broker profile image
exports.uploadBrokerProfileImage = async (fileBuffer) => {
  return await this.uploadToCloudinary(fileBuffer, 'estate/brokers/profiles', 'image');
};

// Upload broker documents
exports.uploadBrokerDocument = async (fileBuffer, documentType) => {
  const folder = `estate/brokers/documents/${documentType}`;
  return await this.uploadToCloudinary(fileBuffer, folder, 'auto');
};

// Upload property images
exports.uploadPropertyImages = async (files) => {
  return await this.uploadMultipleToCloudinary(files, 'estate/properties');
};