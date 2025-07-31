const OTP_EXPIRY_MINUTES = 10;
const pendingUsers = new Map(); // key: email, value: { userData, otp, expiresAt }

function setPendingUser(email, userData, otp) {
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
  pendingUsers.set(email, { userData, otp, expiresAt });
}

function getPendingUser(email) {
  const entry = pendingUsers.get(email);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    pendingUsers.delete(email);
    return null;
  }
  return entry;
}

function deletePendingUser(email) {
  pendingUsers.delete(email);
}

function cleanupExpired() {
  const now = Date.now();
  for (const [email, entry] of pendingUsers.entries()) {
    if (now > entry.expiresAt) {
      pendingUsers.delete(email);
    }
  }
}

function startCleanupInterval() {
  setInterval(cleanupExpired, 60 * 1000); // every 1 minute
}

module.exports = {
  setPendingUser,
  getPendingUser,
  deletePendingUser,
  cleanupExpired,
  startCleanupInterval,
}; 