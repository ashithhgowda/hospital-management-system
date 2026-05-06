const express = require('express');
const router = express.Router();
const {
  addDoctor,
  deleteDoctor,
  getAllDoctors,
  getDoctorsBySpecialization,
  getAvailableSlots,
} = require('../controllers/doctorController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllDoctors);
router.get('/specialization/:specialization', getDoctorsBySpecialization);
router.get('/:id/slots', getAvailableSlots);

// Admin only
router.post('/', protect, isAdmin, addDoctor);
router.delete('/:id', protect, isAdmin, deleteDoctor);

module.exports = router;
