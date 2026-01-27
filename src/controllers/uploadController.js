const uploadService = require('../services/uploadService');
const { Broker, Property } = require('../models');

// @desc    Upload broker profile image
// @route   POST /api/upload/broker/profile-image
// @access  Private (Broker)
exports.uploadBrokerProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await uploadService.uploadBrokerProfileImage(req.file.buffer);

    // Update broker profile
    const broker = await Broker.findOne({
      where: { userId: req.user.id }
    });

    if (broker) {
      await broker.update({ profileImage: result.url });
    }

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId
      }
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile image'
    });
  }
};

// @desc    Upload broker license document
// @route   POST /api/upload/broker/license-document
// @access  Private (Broker)
exports.uploadLicenseDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await uploadService.uploadBrokerDocument(req.file.buffer, 'license');

    // Update broker profile
    const broker = await Broker.findOne({
      where: { userId: req.user.id }
    });

    if (broker) {
      await broker.update({ licenseDocument: result.url });
    }

    res.status(200).json({
      success: true,
      message: 'License document uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId
      }
    });

  } catch (error) {
    console.error('Error uploading license document:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading license document'
    });
  }
};

// @desc    Upload broker ID proof
// @route   POST /api/upload/broker/id-proof
// @access  Private (Broker)
exports.uploadIdProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await uploadService.uploadBrokerDocument(req.file.buffer, 'id-proof');

    // Update broker profile
    const broker = await Broker.findOne({
      where: { userId: req.user.id }
    });

    if (broker) {
      await broker.update({ idProof: result.url });
    }

    res.status(200).json({
      success: true,
      message: 'ID proof uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId
      }
    });

  } catch (error) {
    console.error('Error uploading ID proof:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading ID proof'
    });
  }
};

// @desc    Upload multiple broker documents
// @route   POST /api/upload/broker/documents
// @access  Private (Broker)
exports.uploadBrokerDocuments = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = {};

    // Upload profile image
    if (req.files.profileImage) {
      const result = await uploadService.uploadBrokerProfileImage(req.files.profileImage[0].buffer);
      uploadedFiles.profileImage = result.url;
    }

    // Upload license document
    if (req.files.licenseDocument) {
      const result = await uploadService.uploadBrokerDocument(req.files.licenseDocument[0].buffer, 'license');
      uploadedFiles.licenseDocument = result.url;
    }

    // Upload ID proof
    if (req.files.idProof) {
      const result = await uploadService.uploadBrokerDocument(req.files.idProof[0].buffer, 'id-proof');
      uploadedFiles.idProof = result.url;
    }

    // Update broker profile with all uploaded files
    const broker = await Broker.findOne({
      where: { userId: req.user.id }
    });

    if (broker) {
      await broker.update(uploadedFiles);
    }

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Error uploading broker documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading documents'
    });
  }
};

// @desc    Upload property images
// @route   POST /api/upload/property/images
// @access  Private (Broker)
exports.uploadPropertyImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // Upload all images to Cloudinary
    const uploadPromises = req.files.map(file => 
      uploadService.uploadToCloudinary(file.buffer, 'estate/properties', 'image')
    );

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map(result => result.url);

    res.status(200).json({
      success: true,
      message: 'Property images uploaded successfully',
      data: {
        images: imageUrls
      }
    });

  } catch (error) {
    console.error('Error uploading property images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading property images'
    });
  }
};

// @desc    Upload single property image
// @route   POST /api/upload/property/image
// @access  Private (Broker)
exports.uploadPropertyImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await uploadService.uploadToCloudinary(
      req.file.buffer, 
      'estate/properties', 
      'image'
    );

    res.status(200).json({
      success: true,
      message: 'Property image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId
      }
    });

  } catch (error) {
    console.error('Error uploading property image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading property image'
    });
  }
};