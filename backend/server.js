import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import User from './models/User.js';
import Vehicle from './models/Vehicle.js';
import Log from './models/Log.js';
import Shift from './models/Shift.js';
import Incident from './models/Incident.js';
import Report from './models/Report.js';
import Query from './models/Query.js';

import { verifyRole, loginUser, MOCK_USERS, addMockUser } from './auth.js';
import { validateLogin, validateRegister } from './validators.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
let MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  MONGODB_URI = MONGODB_URI.trim().replace(/^['"]|['"]$/g, '');
}

app.use(cors());
app.use(express.json());

let dbConnectionError = null;

// Database connection middleware to ensure connection on serverless functions
const connectDbMiddleware = async (req, res, next) => {
  if (MONGODB_URI && mongoose.connection.readyState !== 1) {
    console.log(`Connecting to MongoDB... Current state: ${mongoose.connection.readyState}`);
    try {
      await mongoose.connect(MONGODB_URI);
      dbConnectionError = null;
    } catch (err) {
      console.error('❌ Database connection middleware error:', err.message);
      dbConnectionError = err.message;
    }
  }
  next();
};

app.use(connectDbMiddleware);

// Verify MongoDB URI is present and connect
if (!MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI is not defined in the environment variables. The server will run in fallback in-memory mode or wait for configuration.');
} else {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB Atlas successfully.');
      dbConnectionError = null;
      await seedDatabase();
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
      dbConnectionError = err.message;
    });
}

// Format shift time logs helper
const getFormattedTime = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// Global Mock Report Data for seeding and in-memory fallback
const MOCK_REPORT_DATA = [
  { date: new Date(), vehId: 'VAN-101', driver: 'Alex Rivera', status: 'En Route', shift: '08:00 UTC', hours: '4.5', note: 'Sector 4 delivery completed' },
  { date: new Date(), vehId: 'VAN-102', driver: 'Samantha Smith', status: 'En Route', shift: '08:15 UTC', hours: '4.2', note: 'North Hub route active' },
  { date: new Date(), vehId: 'VAN-104', driver: 'David Kim', status: 'Maintenance', shift: '07:15 UTC', hours: '2.0', note: 'Flat right tire' },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), vehId: 'VAN-103', driver: 'Marcus Chen', status: 'Idle', shift: 'Not Started', hours: '0.0', note: 'Base Depot' },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), vehId: 'VAN-101', driver: 'Alex Rivera', status: 'En Route', shift: '08:00 UTC', hours: '7.5', note: 'Route 66 delivery' },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), vehId: 'VAN-105', driver: 'Sarah Jenkins', status: 'Idle', shift: '10:00 UTC', hours: '6.0', note: 'Depot B' },
  { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), vehId: 'VAN-102', driver: 'Samantha Smith', status: 'Idle', shift: '08:15 UTC', hours: '8.0', note: 'Completed shift' },
  { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), vehId: 'VAN-104', driver: 'David Kim', status: 'Maintenance', shift: '07:00 UTC', hours: '4.0', note: 'Oil change service' }
];

// Database seeding helper
async function seedDatabase() {
  try {
    // 1. Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding default users...');
      const seedUsers = [
        { email: 'admin@fleetops.com', password: 'admin123', role: 'admin' },
        { email: 'manager@fleetops.com', password: 'manager123', role: 'manager' },
        { email: 'driver@fleetops.com', password: 'driver123', role: 'driver' }
      ];
      await User.insertMany(seedUsers);
      console.log('✅ Seeding users completed.');
    }

    // 2. Seed Vehicles
    const vehicleCount = await Vehicle.countDocuments();
    if (vehicleCount === 0) {
      console.log('🌱 Seeding default vehicles...');
      const seedVehicles = [
        { id: 'FO-101', driver: 'Marcus Vance', type: 'Semi-Truck (Class 8)', status: 'En Route', fuel: 78, speed: 62, location: 'Denver, CO', destination: 'Salt Lake City, UT', telemetry: { temp: 195, load: 'Produce (22 tons)', pressure: '110 psi' }, alerts: [] },
        { id: 'FO-102', driver: 'Sarah Connor', type: 'Delivery Van', status: 'En Route', fuel: 92, speed: 45, location: 'Seattle, WA', destination: 'Bellevue, WA', telemetry: { temp: 180, load: 'Electronics (1.2 tons)', pressure: '35 psi' }, alerts: [] },
        { id: 'FO-103', driver: 'N/A', type: 'Box Truck', status: 'Idle', fuel: 45, speed: 0, location: 'Austin, TX', destination: 'N/A (Depot A)', telemetry: { temp: 75, load: 'Empty', pressure: '85 psi' }, alerts: [] },
        { id: 'FO-104', driver: 'N/A', type: 'Semi-Truck (Class 8)', status: 'Maintenance', fuel: 12, speed: 0, location: 'Chicago, IL', destination: 'Service Center 4', telemetry: { temp: 240, load: 'None', pressure: '90 psi' }, alerts: [{ id: 'a1', severity: 'high', type: 'Engine Overheat', message: 'Coolant temperature above threshold (240°F)' }] },
        { id: 'FO-105', driver: 'Alex Mercer', type: 'Delivery Van', status: 'En Route', fuel: 55, speed: 38, location: 'New York, NY', destination: 'Brooklyn, NY', telemetry: { temp: 185, load: 'Parcels (0.8 tons)', pressure: '34 psi' }, alerts: [] },
        { id: 'FO-106', driver: 'James Wilson', type: 'Box Truck', status: 'En Route', fuel: 64, speed: 52, location: 'Atlanta, GA', destination: 'Savannah, GA', telemetry: { temp: 190, load: 'Furniture (4.5 tons)', pressure: '88 psi' }, alerts: [] },
        { id: 'FO-107', driver: 'N/A', type: 'Semi-Truck (Class 8)', status: 'Idle', fuel: 89, speed: 0, location: 'Los Angeles, CA', destination: 'N/A (Depot C)', telemetry: { temp: 80, load: 'Empty', pressure: '108 psi' }, alerts: [] },
        { id: 'FO-108', driver: 'N/A', type: 'Flatbed Truck', status: 'Maintenance', fuel: 34, speed: 0, location: 'Phoenix, AZ', destination: 'Maintenance Yard B', telemetry: { temp: 120, load: 'Steel Rails (12 tons)', pressure: '95 psi' }, alerts: [{ id: 'a2', severity: 'medium', type: 'Brake Wear', message: 'Rear brake pads at 15% life' }] }
      ];
      await Vehicle.insertMany(seedVehicles);
      console.log('✅ Seeding vehicles completed.');
    }

    // 3. Seed Logs
    const logCount = await Log.countDocuments();
    if (logCount === 0) {
      console.log('🌱 Seeding default logs...');
      const seedLogs = [
        { timestamp: '11:40 AM', vehicleId: 'FO-102', event: 'Status updated to En Route', type: 'info' },
        { timestamp: '11:35 AM', vehicleId: 'FO-104', event: 'High engine temperature warning detected', type: 'warning' },
        { timestamp: '11:20 AM', vehicleId: 'FO-108', event: 'Scheduled maintenance check-in', type: 'info' },
        { timestamp: '11:05 AM', vehicleId: 'FO-103', event: 'Arrived at Austin Depot A', type: 'success' }
      ];
      await Log.insertMany(seedLogs);
      console.log('✅ Seeding logs completed.');
    }

    // 4. Seed Reports
    const reportCount = await Report.countDocuments();
    if (reportCount === 0) {
      console.log('🌱 Seeding default report data...');
      await Report.insertMany(MOCK_REPORT_DATA);
      console.log('✅ Seeding reports completed.');
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
}



// Server Health Endpoints
app.get('/', (req, res) => {
  res.json({ message: 'FleetOps REST API with MongoDB is running.' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    databaseState: mongoose.connection.readyState,
    hasMongoUri: !!MONGODB_URI,
    connectionError: dbConnectionError,
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Authentication Endpoint
app.post('/api/auth/login', validateLogin, loginUser);

// Driver Registration Endpoint (Admin only)
app.post('/api/auth/register-driver', verifyRole(['admin']), validateRegister, async (req, res) => {
  const { email, password } = req.body;
  const emailLower = email.toLowerCase();

  // Handle in-memory fallback if MongoDB is not connected
  if (mongoose.connection.readyState !== 1) {
    console.log('MongoDB not connected. Using in-memory fallback for driver registration.');
    const added = addMockUser(emailLower, password, 'driver');
    if (!added) {
      return res.status(400).json({ error: 'A user with this email is already registered.' });
    }
    return res.status(201).json({
      success: true,
      user: {
        email: emailLower,
        role: 'driver'
      }
    });
  }

  try {
    const newUser = new User({
      email: emailLower,
      password,
      role: 'driver'
    });
    await newUser.save();

    // Create system log for registration
    const newLog = new Log({
      timestamp: getFormattedTime(),
      vehicleId: 'SYSTEM',
      event: `Admin registered new driver: ${emailLower}`,
      type: 'success'
    });
    await newLog.save();

    res.status(201).json({
      success: true,
      user: {
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Drivers List Endpoint (Admin & Manager)
app.get('/api/drivers', verifyRole(['admin', 'manager']), async (req, res) => {
  // Handle in-memory fallback if MongoDB is not connected
  if (mongoose.connection.readyState !== 1) {
    const drivers = MOCK_USERS.filter(u => u.role === 'driver').map(u => ({
      email: u.email,
      role: u.role,
      createdAt: new Date()
    }));
    return res.json(drivers);
  }

  try {
    const drivers = await User.find({ role: 'driver' }).select('-password').sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Vehicle Endpoints
app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/vehicles/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, speed, fuel, telemetry, alerts } = req.body;

  try {
    const vehicle = await Vehicle.findOne({ id });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    if (status !== undefined) vehicle.status = status;
    if (speed !== undefined) vehicle.speed = speed;
    if (fuel !== undefined) vehicle.fuel = fuel;
    if (telemetry !== undefined) {
      vehicle.telemetry = {
        ...vehicle.telemetry,
        ...telemetry
      };
    }
    if (alerts !== undefined) vehicle.alerts = alerts;

    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicles/:id/select', async (req, res) => {
  const { id } = req.params;
  const { driverName } = req.body;

  try {
    const vehicle = await Vehicle.findOne({ id });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    vehicle.driver = driverName;
    await vehicle.save();
    
    const newLog = new Log({
      timestamp: getFormattedTime(),
      vehicleId: id,
      event: `Assigned to driver: ${driverName}`,
      type: 'info'
    });
    await newLog.save();

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicles/:id/deselect', async (req, res) => {
  const { id } = req.params;

  try {
    const vehicle = await Vehicle.findOne({ id });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    const driverName = vehicle.driver;
    vehicle.driver = 'N/A';
    await vehicle.save();
    
    const newLog = new Log({
      timestamp: getFormattedTime(),
      vehicleId: id,
      event: `Unassigned driver: ${driverName}`,
      type: 'info'
    });
    await newLog.save();

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Shift Endpoints
app.get('/api/shifts', async (req, res) => {
  try {
    const shifts = await Shift.find();
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shifts/start', async (req, res) => {
  const { driverName, vehicleId } = req.body;
  if (!driverName || !vehicleId) {
    return res.status(400).json({ error: 'Please provide driverName and vehicleId.' });
  }

  try {
    const vehicle = await Vehicle.findOne({ id: vehicleId });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    vehicle.driver = driverName;
    vehicle.status = 'En Route';
    vehicle.speed = 55; 
    await vehicle.save();

    const newShift = new Shift({
      driverName,
      vehicleId,
      startTime: new Date(),
      endTime: null,
      status: 'Active'
    });
    await newShift.save();

    const newLog = new Log({
      timestamp: getFormattedTime(),
      vehicleId,
      event: `Driver ${driverName} started shift. Status: En Route.`,
      type: 'success'
    });
    await newLog.save();

    res.json({ shift: newShift, vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shifts/end', async (req, res) => {
  const { shiftId } = req.body;

  try {
    let shift;
    if (shiftId) {
      shift = await Shift.findOne({ id: shiftId });
    } else {
      shift = await Shift.findOne({ status: 'Active' }).sort({ createdAt: -1 });
    }

    if (!shift) {
      return res.status(404).json({ error: 'No active shift found.' });
    }

    shift.endTime = new Date();
    shift.status = 'Completed';
    await shift.save();

    const vehicle = await Vehicle.findOne({ id: shift.vehicleId });
    if (vehicle) {
      vehicle.status = 'Idle';
      vehicle.speed = 0;
      vehicle.driver = 'N/A';
      await vehicle.save();
    }

    const newLog = new Log({
      timestamp: getFormattedTime(),
      vehicleId: shift.vehicleId,
      event: `Driver ${shift.driverName} ended shift. Status: Idle.`,
      type: 'info'
    });
    await newLog.save();

    res.json({ shift, vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Incident Endpoints
app.get('/api/incidents', async (req, res) => {
  try {
    const incidents = await Incident.find();
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incidents', async (req, res) => {
  const { vehicleId, driverName, type, severity, location, description } = req.body;
  if (!vehicleId || !type || !severity) {
    return res.status(400).json({ error: 'Missing required incident fields.' });
  }

  try {
    const vehicle = await Vehicle.findOne({ id: vehicleId });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    const newIncident = new Incident({
      vehicleId,
      driverName: driverName || 'Unknown',
      type,
      severity,
      location: location || 'Unknown',
      description,
      timestamp: new Date()
    });
    await newIncident.save();

    const newAlert = {
      id: 'alert-' + Date.now(),
      severity: severity.toLowerCase() === 'high' ? 'high' : severity.toLowerCase() === 'medium' ? 'medium' : 'low',
      type,
      message: description
    };
    vehicle.alerts.push(newAlert);
    await vehicle.save();

    const newLog = new Log({
      timestamp: getFormattedTime(),
      vehicleId,
      event: `Incident Reported (${type}): ${description}`,
      type: severity.toLowerCase() === 'high' ? 'warning' : 'info'
    });
    await newLog.save();

    res.json({ incident: newIncident, vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log Endpoints
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logs', async (req, res) => {
  const { vehicleId, event, type } = req.body;
  if (!vehicleId || !event) {
    return res.status(400).json({ error: 'Please provide vehicleId and event description.' });
  }

  try {
    const newLog = new Log({
      timestamp: getFormattedTime(),
      vehicleId,
      event,
      type: type || 'info'
    });
    await newLog.save();

    const logs = await Log.find().sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public Contact Inquiry Endpoint (Landing Page Contact Form)
app.post('/api/queries', async (req, res) => {
  const { name, email, fleetSize, message } = req.body;
  if (!name || !email || !fleetSize || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    if (!MONGODB_URI) {
      console.log('MongoDB not connected. Handling landing page query in mock mode.');
      return res.status(201).json({ success: true, message: 'Mock query received.' });
    }

    const newQuery = new Query({ name, email, fleetSize, message });
    await newQuery.save();

    res.status(201).json({ success: true, query: newQuery });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Queries Endpoint (Admin & Manager)
app.get('/api/queries', verifyRole(['admin', 'manager']), async (req, res) => {
  try {
    if (!MONGODB_URI) {
      return res.json([
        { _id: 'mock-1', name: 'John Doe', email: 'john@gmail.com', fleetSize: '51-200', message: 'Hi there, we would love a custom TMS integration audit for our 80 delivery trucks.', createdAt: new Date() },
        { _id: 'mock-2', name: 'Sarah Jenkins', email: 'sjenkins@depot.com', fleetSize: '500+', message: 'Looking for bulk pricing details for enterprise active route dispatching.', createdAt: new Date(Date.now() - 3600000) }
      ]);
    }

    const queries = await Query.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Query / Mark as Resolved Endpoint (Admin & Manager)
app.delete('/api/queries/:id', verifyRole(['admin', 'manager']), async (req, res) => {
  const { id } = req.params;
  try {
    if (!MONGODB_URI) {
      return res.json({ success: true, message: 'Mock query deleted.' });
    }

    const deleted = await Query.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Query not found.' });
    }

    res.json({ success: true, message: 'Query deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Report Export Endpoint
app.get('/api/reports/export-csv', verifyRole(['admin', 'manager']), async (req, res) => {
  const { range } = req.query;
  
  try {
    let reports = [];
    
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected. Using MOCK_REPORT_DATA in-memory fallback for CSV export.');
      const now = new Date();
      if (range === 'today') {
        reports = MOCK_REPORT_DATA.filter(item => {
          return item.date.toDateString() === now.toDateString();
        });
      } else if (range === 'last_30_days') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        reports = MOCK_REPORT_DATA.filter(item => item.date >= thirtyDaysAgo);
      } else {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        reports = MOCK_REPORT_DATA.filter(item => item.date >= oneWeekAgo);
      }
    } else {
      let query = {};
      if (range === 'today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        query.date = { $gte: startOfDay, $lte: endOfDay };
      } else if (range === 'last_30_days') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        query.date = { $gte: thirtyDaysAgo };
      } else {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        query.date = { $gte: oneWeekAgo };
      }
      reports = await Report.find(query);
    }
    
    let csv = 'VEH ID,ASSIGNED DRIVER,STATUS,SHIFT (UTC),HOURS WORKED,NOTES,DATE\n';
    reports.forEach(item => {
      const formattedDate = item.date.toISOString().split('T')[0];
      csv += `"${item.vehId}","${item.driver}","${item.status}","${item.shift}","${item.hours}","${item.note.replace(/"/g, '""')}","${formattedDate}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fleet-report.csv"');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
