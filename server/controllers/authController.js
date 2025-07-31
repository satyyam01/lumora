const User = require('../models/User');
const bcrypt = require('bcrypt');
const { signToken } = require('../utils/jwt');
const { setPendingUser, getPendingUser, deletePendingUser } = require('../utils/otpStore');
const { sendEmail, otpVerification } = require('../utils/emailService');
const JournalEntry = require('../models/JournalEntry');
const ChatSession = require('../models/ChatSession');
const MemorySnapshot = require('../models/MemorySnapshot');
const { deleteUserVectorsFromPinecone } = require('../ai/pinecone');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    const token = signToken({ userId: user._id, email: user.email });
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = signToken({ userId: user._id, email: user.email });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/request-otp
exports.requestOtp = async (req, res) => {
  try {
    const { email, password, name, dob, ...rest } = req.body;
    if (!email || !password || !name || !dob) {
      return res.status(400).json({ message: 'Email, password, name, and dob are required.' });
    }
    if (isNaN(Date.parse(dob))) {
      return res.status(400).json({ message: 'Invalid date of birth.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Store pending user
    setPendingUser(email, { email, password, name, dob: new Date(dob), ...rest }, otp);
    // Send OTP email
    const html = otpVerification(name, otp);
    await sendEmail({
      to: email,
      subject: 'Your Lumora OTP Verification Code',
      html
    });
    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }
    const entry = getPendingUser(email);
    if (!entry) {
      return res.status(410).json({ message: 'OTP expired or not found.' });
    }
    if (entry.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP.' });
    }
    // Create user in DB
    const hashedPassword = await bcrypt.hash(entry.userData.password, 10);
    const user = new User({ ...entry.userData, password: hashedPassword });
    await user.save();
    deletePendingUser(email);
    const token = signToken({ userId: user._id, email: user.email });
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('name email dob');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ profile: user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateName = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters.' });
    }
    const user = await User.findByIdAndUpdate(userId, { name }, { new: true, runValidators: true, context: 'query' }).select('name email age');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ profile: user, message: 'Name updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.startEmailChange = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { newEmail } = req.body;
    if (!newEmail || typeof newEmail !== 'string') {
      return res.status(400).json({ message: 'New email is required.' });
    }
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Store pending email change
    setPendingUser(newEmail, { userId, newEmail }, otp);
    // Send OTP email
    const html = otpVerification(newEmail.split('@')[0], otp);
    await sendEmail({
      to: newEmail,
      subject: 'Your Lumora Email Change OTP',
      html
    });
    res.json({ message: 'OTP sent to new email.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verifyEmailChange = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { newEmail, otp } = req.body;
    if (!newEmail || !otp) {
      return res.status(400).json({ message: 'New email and OTP are required.' });
    }
    const entry = getPendingUser(newEmail);
    if (!entry || entry.userId !== userId) {
      return res.status(410).json({ message: 'OTP expired or not found.' });
    }
    if (entry.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP.' });
    }
    // Update user's email
    const user = await User.findByIdAndUpdate(userId, { email: newEmail }, { new: true, runValidators: true, context: 'query' }).select('name email age');
    deletePendingUser(newEmail);
    res.json({ profile: user, message: 'Email updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateDob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { dob } = req.body;
    if (!dob || isNaN(Date.parse(dob))) {
      return res.status(400).json({ message: 'Valid date of birth is required.' });
    }
    const user = await User.findByIdAndUpdate(userId, { dob: new Date(dob) }, { new: true, runValidators: true, context: 'query' }).select('name email dob');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ profile: user, message: 'DOB updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Delete all journal entries
    await JournalEntry.deleteMany({ user: userId });
    // Delete all chat sessions
    await ChatSession.deleteMany({ user: userId });
    // Delete all memory snapshots
    await MemorySnapshot.deleteMany({ user: userId });
    // Delete Pinecone vectors
    try {
      await deleteUserVectorsFromPinecone(userId);
    } catch (err) {
      console.error('Pinecone delete error:', err.message);
    }
    // Delete user
    await User.findByIdAndDelete(userId);
    res.json({ success: true, message: 'Account and all associated data deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete account', error: err.message });
  }
}; 