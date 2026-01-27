const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { isBroker } = require('../middleware/roleMiddleware');
const { uploadSingle, uploadMultiple, uploadFields, handleMulterError } = require('../middleware/uploadMiddleware');

// All upload routes require authentication
router.use(protect);

// Broker file uploads
router.post(
  '/broker/profile-image',
  isBroker,
  uploadSingle('profileImage'),
  handleMulterError,
  uploadController.uploadBrokerProfileImage
);

router.post(
  '/broker/license-document',
  isBroker,
  uploadSingle('licenseDocument'),
  handleMulterError,
  uploadController.uploadLicenseDocument
);

router.post(
  '/broker/id-proof',
  isBroker,
  uploadSingle('idProof'),
  handleMulterError,
  uploadController.uploadIdProof
);

router.post(
  '/broker/documents',
  isBroker,
  uploadFields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'licenseDocument', maxCount: 1 },
    { name: 'idProof', maxCount: 1 }
  ]),
  handleMulterError,
  uploadController.uploadBrokerDocuments
);

// Property image uploads
router.post(
  '/property/image',
  isBroker,
  uploadSingle('image'),
  handleMulterError,
  uploadController.uploadPropertyImage
);

router.post(
  '/property/images',
  isBroker,
  uploadMultiple('images', 10),
  handleMulterError,
  uploadController.uploadPropertyImages
);

module.exports = router;