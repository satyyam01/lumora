const express = require('express');
const router = express.Router();
const { register, login, requestOtp, verifyOtp, getProfile, updateName, startEmailChange, verifyEmailChange, updateDob, deleteAccount } = require('../controllers/authController');
const auth = require('../middleware/auth');

// OTP signup endpoints
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);

// Profile endpoint
router.get('/profile', auth, getProfile);
router.patch('/profile/name', auth, updateName);
router.patch('/profile/dob', auth, updateDob);
router.post('/profile/email/request-otp', auth, startEmailChange);
router.post('/profile/email/verify-otp', auth, verifyEmailChange);
router.delete('/profile', auth, deleteAccount);

// POST /api/register
router.post('/register', register);
router.post('/login', login);

module.exports = router;
