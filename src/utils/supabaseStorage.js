const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Upload single image to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original filename
 * @param {string} folder - Folder name in bucket (e.g., 'properties', 'profiles')
 * @returns {Promise<Object>} Upload result with URL
 */
const uploadImage = async (fileBuffer, fileName, folder = 'properties') => {
  try {
    const timestamp = Date.now();
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'property-images')
      .upload(uniqueFileName, fileBuffer, {
        contentType: `image/${fileExt}`,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'property-images')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrl,
      path: data.path,
      fileName: uniqueFileName
    };

  } catch (error) {
    console.error('❌ Image upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload multiple images to Supabase Storage
 * @param {Array} files - Array of file objects with buffer and originalname
 * @param {string} folder - Folder name in bucket
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleImages = async (files, folder = 'properties') => {
  try {
    const uploadPromises = files.map(file => 
      uploadImage(file.buffer, file.originalname, folder)
    );

    const results = await Promise.all(uploadPromises);
    
    // Filter successful uploads
    const successfulUploads = results
      .filter(result => result.success)
      .map(result => result.url);

    const failedUploads = results.filter(result => !result.success);

    if (failedUploads.length > 0) {
      console.warn(`⚠️ ${failedUploads.length} images failed to upload`);
    }

    return {
      success: true,
      urls: successfulUploads,
      failed: failedUploads.length,
      total: files.length
    };

  } catch (error) {
    console.error('❌ Multiple image upload failed:', error);
    return {
      success: false,
      error: error.message,
      urls: []
    };
  }
};

/**
 * Delete image from Supabase Storage
 * @param {string} filePath - Path to file in bucket
 * @returns {Promise<Object>} Delete result
 */
const deleteImage = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'property-images')
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    return {
      success: true,
      message: 'Image deleted successfully'
    };

  } catch (error) {
    console.error('❌ Image deletion failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete multiple images from Supabase Storage
 * @param {Array<string>} filePaths - Array of file paths
 * @returns {Promise<Object>} Delete result
 */
const deleteMultipleImages = async (filePaths) => {
  try {
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'property-images')
      .remove(filePaths);

    if (error) {
      throw new Error(`Bulk delete failed: ${error.message}`);
    }

    return {
      success: true,
      message: `${filePaths.length} images deleted successfully`
    };

  } catch (error) {
    console.error('❌ Multiple image deletion failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Extract file path from Supabase public URL
 * @param {string} publicUrl - Full public URL
 * @returns {string} File path
 */
const extractPathFromUrl = (publicUrl) => {
  try {
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'property-images';
    const parts = publicUrl.split(`/storage/v1/object/public/${bucketName}/`);
    return parts[1] || '';
  } catch (error) {
    console.error('❌ Failed to extract path from URL:', error);
    return '';
  }
};

/**
 * Check if Supabase Storage is configured
 * @returns {boolean}
 */
const isStorageConfigured = () => {
  return !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_ANON_KEY &&
    process.env.SUPABASE_STORAGE_BUCKET
  );
};

/**
 * Get storage bucket info
 * @returns {Promise<Object>}
 */
const getBucketInfo = async () => {
  try {
    const { data, error } = await supabase.storage
      .getBucket(process.env.SUPABASE_STORAGE_BUCKET || 'property-images');

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      bucket: data
    };

  } catch (error) {
    console.error('❌ Failed to get bucket info:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  extractPathFromUrl,
  isStorageConfigured,
  getBucketInfo,
  supabase
};