const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ FIX: Helper used internally — named so exports.* can reference it safely
const uploadToCloudinary = async (fileBuffer, folder = 'estate', resourceType = 'auto') => {
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

// ✅ FIX: Export as named function — no more "this" context issues
exports.uploadToCloudinary = uploadToCloudinary;

// Upload multiple files to Cloudinary
// ✅ FIX: was "this.uploadToCloudinary" which is undefined in CommonJS exports
exports.uploadMultipleToCloudinary = async (files, folder = 'estate') => {
  const uploadPromises = files.map(file =>
    uploadToCloudinary(file.buffer, folder)  // ✅ direct function call
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
// ✅ FIX: was "this.uploadToCloudinary" — now direct call
exports.uploadBrokerProfileImage = async (fileBuffer) => {
  return await uploadToCloudinary(fileBuffer, 'estate/brokers/profiles', 'image');
};

// Upload broker documents (license, id-proof etc.)
// ✅ FIX: was "this.uploadToCloudinary" — now direct call
exports.uploadBrokerDocument = async (fileBuffer, documentType) => {
  const folder = `estate/brokers/documents/${documentType}`;
  return await uploadToCloudinary(fileBuffer, folder, 'auto');
};

// Upload property images
// ✅ FIX: was "this.uploadMultipleToCloudinary" — now direct call
exports.uploadPropertyImages = async (files) => {
  const uploadPromises = files.map(file =>
    uploadToCloudinary(file.buffer, 'estate/properties', 'image')
  );
  return await Promise.all(uploadPromises);
};