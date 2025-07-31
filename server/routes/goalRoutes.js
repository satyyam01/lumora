const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Set or update goal
router.post('/set', goalController.setGoal);

// Get current goal
router.get('/current', goalController.getGoal);

// Cancel goal
router.delete('/cancel', goalController.cancelGoal);

// Update reminder settings
router.put('/reminder-settings', goalController.updateReminderSettings);

module.exports = router; 