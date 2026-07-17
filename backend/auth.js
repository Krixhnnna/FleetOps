import mongoose from 'mongoose';
import User from './models/User.js';

export let MOCK_USERS = [
  { email: 'admin@fleetops.com', password: 'admin123', role: 'admin' },
  { email: 'manager@fleetops.com', password: 'manager123', role: 'manager' },
  { email: 'driver@fleetops.com', password: 'driver123', role: 'driver' }
];

export function addMockUser(email, password, role) {
  const emailLower = email.toLowerCase();
  const exists = MOCK_USERS.some(u => u.email.toLowerCase() === emailLower);
  if (exists) return false;
  MOCK_USERS.push({ email: emailLower, password, role });
  return true;
}

// Middleware to verify authorization role
export function verifyRole(allowedRoles) {
  return (req, res, next) => {
    console.log('Incoming headers for verification:', req.headers);
    console.log('Incoming query params:', req.query);
    const userRole = req.headers['x-user-role'] || req.query.role;
    
    if (!userRole) {
      console.log('No x-user-role header or query parameter found in request.');
      return res.status(401).json({ message: 'Unauthorized: No operational role provided.' });
    }
    
    // Normalize roles for comparison (case-insensitive)
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
    
    // Map common role aliases
    let finalRole = normalizedUserRole;
    if (normalizedUserRole === 'fleetmanager') finalRole = 'manager';
    
    if (!normalizedAllowedRoles.includes(finalRole)) {
      return res.status(403).json({ 
        message: 'Security Guardrail: Access Denied. Role strictly unauthorized for Export Hub operations.' 
      });
    }
    next();
  };
}

// Authentication handler
export async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  // Fallback to in-memory user check if MongoDB is not connected
  if (mongoose.connection.readyState !== 1) {
    console.log('MongoDB not connected. Using in-memory user fallback.');
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Access Denied.' });
    }
    return res.json({
      success: true,
      user: {
        email: user.email,
        role: user.role
      }
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials. Access Denied.' });
    }

    res.json({
      success: true,
      user: {
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
