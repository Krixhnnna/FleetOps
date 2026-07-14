import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const USERS = [
  { email: 'admin@fleetops.com', password: 'admin123', role: 'admin' },
  { email: 'manager@fleetops.com', password: 'manager123', role: 'manager' },
  { email: 'driver@fleetops.com', password: 'driver123', role: 'driver' }
];

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

function verifyRole(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (!userRole) {
      return res.status(401).json({ message: 'Unauthorized: No operational role provided.' });
    }
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Security Guardrail: Access Denied. Role strictly unauthorized for Export Hub operations.' 
      });
    }
    next();
  };
}


let vehicles = [
  { id: 'FO-101', driver: 'Marcus Vance', type: 'Semi-Truck (Class 8)', status: 'En Route', fuel: 78, speed: 62, location: 'Denver, CO', destination: 'Salt Lake City, UT', telemetry: { temp: 195, load: 'Produce (22 tons)', pressure: '110 psi' }, alerts: [] },
  { id: 'FO-102', driver: 'Sarah Connor', type: 'Delivery Van', status: 'En Route', fuel: 92, speed: 45, location: 'Seattle, WA', destination: 'Bellevue, WA', telemetry: { temp: 180, load: 'Electronics (1.2 tons)', pressure: '35 psi' }, alerts: [] },
  { id: 'FO-103', driver: 'N/A', type: 'Box Truck', status: 'Idle', fuel: 45, speed: 0, location: 'Austin, TX', destination: 'N/A (Depot A)', telemetry: { temp: 75, load: 'Empty', pressure: '85 psi' }, alerts: [] },
  { id: 'FO-104', driver: 'N/A', type: 'Semi-Truck (Class 8)', status: 'Maintenance', fuel: 12, speed: 0, location: 'Chicago, IL', destination: 'Service Center 4', telemetry: { temp: 240, load: 'None', pressure: '90 psi' }, alerts: [{ id: 'a1', severity: 'high', type: 'Engine Overheat', message: 'Coolant temperature above threshold (240°F)' }] },
  { id: 'FO-105', driver: 'Alex Mercer', type: 'Delivery Van', status: 'En Route', fuel: 55, speed: 38, location: 'New York, NY', destination: 'Brooklyn, NY', telemetry: { temp: 185, load: 'Parcels (0.8 tons)', pressure: '34 psi' }, alerts: [] },
  { id: 'FO-106', driver: 'James Wilson', type: 'Box Truck', status: 'En Route', fuel: 64, speed: 52, location: 'Atlanta, GA', destination: 'Savannah, GA', telemetry: { temp: 190, load: 'Furniture (4.5 tons)', pressure: '88 psi' }, alerts: [] },
  { id: 'FO-107', driver: 'N/A', type: 'Semi-Truck (Class 8)', status: 'Idle', fuel: 89, speed: 0, location: 'Los Angeles, CA', destination: 'N/A (Depot C)', telemetry: { temp: 80, load: 'Empty', pressure: '108 psi' }, alerts: [] },
  { id: 'FO-108', driver: 'N/A', type: 'Flatbed Truck', status: 'Maintenance', fuel: 34, speed: 0, location: 'Phoenix, AZ', destination: 'Maintenance Yard B', telemetry: { temp: 120, load: 'Steel Rails (12 tons)', pressure: '95 psi' }, alerts: [{ id: 'a2', severity: 'medium', type: 'Brake Wear', message: 'Rear brake pads at 15% life' }] }
];

let logs = [
  { id: 1, timestamp: '11:40 AM', vehicleId: 'FO-102', event: 'Status updated to En Route', type: 'info' },
  { id: 2, timestamp: '11:35 AM', vehicleId: 'FO-104', event: 'High engine temperature warning detected', type: 'warning' },
  { id: 3, timestamp: '11:20 AM', vehicleId: 'FO-108', event: 'Scheduled maintenance check-in', type: 'info' },
  { id: 4, timestamp: '11:05 AM', vehicleId: 'FO-103', event: 'Arrived at Austin Depot A', type: 'success' }
];

let shifts = [];
let incidents = [];

const getFormattedTime = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

app.get('/', (req, res) => {
  res.json({ message: 'FleetOps REST API is running.' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Access Denied.' });
  }

  res.json({
    success: true,
    user: {
      email: user.email,
      role: user.role
    }
  });
});

app.get('/api/vehicles', (req, res) => {
  res.json(vehicles);
});

app.put('/api/vehicles/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, speed, fuel, telemetry, alerts } = req.body;

  const vehicleIndex = vehicles.findIndex(v => v.id === id);
  if (vehicleIndex === -1) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  if (status !== undefined) vehicles[vehicleIndex].status = status;
  if (speed !== undefined) vehicles[vehicleIndex].speed = speed;
  if (fuel !== undefined) vehicles[vehicleIndex].fuel = fuel;
  if (telemetry !== undefined) {
    vehicles[vehicleIndex].telemetry = {
      ...vehicles[vehicleIndex].telemetry,
      ...telemetry
    };
  }
  if (alerts !== undefined) vehicles[vehicleIndex].alerts = alerts;

  res.json(vehicles[vehicleIndex]);
});

app.post('/api/vehicles/:id/select', (req, res) => {
  const { id } = req.params;
  const { driverName } = req.body;

  const vehicleIndex = vehicles.findIndex(v => v.id === id);
  if (vehicleIndex === -1) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  vehicles[vehicleIndex].driver = driverName;
  
  const newLog = {
    id: Date.now() + Math.random(),
    timestamp: getFormattedTime(),
    vehicleId: id,
    event: `Assigned to driver: ${driverName}`,
    type: 'info'
  };
  logs = [newLog, ...logs.slice(0, 19)];

  res.json(vehicles[vehicleIndex]);
});

app.post('/api/vehicles/:id/deselect', (req, res) => {
  const { id } = req.params;

  const vehicleIndex = vehicles.findIndex(v => v.id === id);
  if (vehicleIndex === -1) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  const driverName = vehicles[vehicleIndex].driver;
  vehicles[vehicleIndex].driver = 'N/A';
  
  const newLog = {
    id: Date.now() + Math.random(),
    timestamp: getFormattedTime(),
    vehicleId: id,
    event: `Unassigned driver: ${driverName}`,
    type: 'info'
  };
  logs = [newLog, ...logs.slice(0, 19)];

  res.json(vehicles[vehicleIndex]);
});

app.get('/api/shifts', (req, res) => {
  res.json(shifts);
});

app.post('/api/shifts/start', (req, res) => {
  const { driverName, vehicleId } = req.body;
  if (!driverName || !vehicleId) {
    return res.status(400).json({ error: 'Please provide driverName and vehicleId.' });
  }

  const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
  if (vehicleIndex === -1) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  vehicles[vehicleIndex].driver = driverName;
  vehicles[vehicleIndex].status = 'En Route';
  vehicles[vehicleIndex].speed = 55; 

  const newShift = {
    id: Date.now().toString(),
    driverName,
    vehicleId,
    startTime: new Date().toISOString(),
    endTime: null,
    status: 'Active'
  };
  shifts.push(newShift);

  const newLog = {
    id: Date.now() + Math.random(),
    timestamp: getFormattedTime(),
    vehicleId,
    event: `Driver ${driverName} started shift. Status: En Route.`,
    type: 'success'
  };
  logs = [newLog, ...logs.slice(0, 19)];

  res.json({ shift: newShift, vehicle: vehicles[vehicleIndex] });
});

app.post('/api/shifts/end', (req, res) => {
  const { shiftId } = req.body;
  let shiftIndex = -1;

  if (shiftId) {
    shiftIndex = shifts.findIndex(s => s.id === shiftId);
  } else {
    shiftIndex = shifts.map(s => s.status).lastIndexOf('Active');
  }

  if (shiftIndex === -1) {
    return res.status(404).json({ error: 'No active shift found.' });
  }

  const shift = shifts[shiftIndex];
  shift.endTime = new Date().toISOString();
  shift.status = 'Completed';

  const vehicleIndex = vehicles.findIndex(v => v.id === shift.vehicleId);
  if (vehicleIndex !== -1) {
    vehicles[vehicleIndex].status = 'Idle';
    vehicles[vehicleIndex].speed = 0;
    vehicles[vehicleIndex].driver = 'N/A';
  }

  const newLog = {
    id: Date.now() + Math.random(),
    timestamp: getFormattedTime(),
    vehicleId: shift.vehicleId,
    event: `Driver ${shift.driverName} ended shift. Status: Idle.`,
    type: 'info'
  };
  logs = [newLog, ...logs.slice(0, 19)];

  res.json({ shift, vehicle: vehicleIndex !== -1 ? vehicles[vehicleIndex] : null });
});

app.get('/api/incidents', (req, res) => {
  res.json(incidents);
});

app.post('/api/incidents', (req, res) => {
  const { vehicleId, driverName, type, severity, location, description } = req.body;
  if (!vehicleId || !type || !severity) {
    return res.status(400).json({ error: 'Missing required incident fields.' });
  }

  const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
  if (vehicleIndex === -1) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  const newIncident = {
    id: Date.now().toString(),
    vehicleId,
    driverName: driverName || 'Unknown',
    type,
    severity,
    location: location || 'Unknown',
    description,
    timestamp: new Date().toISOString()
  };
  incidents.push(newIncident);

  const newAlert = {
    id: 'alert-' + Date.now(),
    severity: severity.toLowerCase() === 'high' ? 'high' : severity.toLowerCase() === 'medium' ? 'medium' : 'low',
    type,
    message: description
  };
  vehicles[vehicleIndex].alerts.push(newAlert);

  const newLog = {
    id: Date.now() + Math.random(),
    timestamp: getFormattedTime(),
    vehicleId,
    event: `Incident Reported (${type}): ${description}`,
    type: severity.toLowerCase() === 'high' ? 'warning' : 'info'
  };
  logs = [newLog, ...logs.slice(0, 19)];

  res.json({ incident: newIncident, vehicle: vehicles[vehicleIndex] });
});

app.get('/api/logs', (req, res) => {
  res.json(logs);
});

app.post('/api/logs', (req, res) => {
  const { vehicleId, event, type } = req.body;
  if (!vehicleId || !event) {
    return res.status(400).json({ error: 'Please provide vehicleId and event description.' });
  }

  const newLog = {
    id: Date.now() + Math.random(),
    timestamp: getFormattedTime(),
    vehicleId,
    event,
    type: type || 'info'
  };
  logs = [newLog, ...logs.slice(0, 19)];

  res.json(logs);
});

app.get('/api/reports/export-csv', verifyRole(['admin', 'manager']), (req, res) => {
  const { range } = req.query;
  const now = new Date();
  let filteredData = [];
  
  if (range === 'today') {
    filteredData = MOCK_REPORT_DATA.filter(item => {
      return item.date.toDateString() === now.toDateString();
    });
  } else if (range === 'last_30_days') {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    filteredData = MOCK_REPORT_DATA.filter(item => item.date >= thirtyDaysAgo);
  } else {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    filteredData = MOCK_REPORT_DATA.filter(item => item.date >= oneWeekAgo);
  }
  
  let csv = 'VEH ID,ASSIGNED DRIVER,STATUS,SHIFT (UTC),HOURS WORKED,NOTES,DATE\n';
  filteredData.forEach(item => {
    const formattedDate = item.date.toISOString().split('T')[0];
    csv += `"${item.vehId}","${item.driver}","${item.status}","${item.shift}","${item.hours}","${item.note.replace(/"/g, '""')}","${formattedDate}"\n`;
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="fleet-report.csv"');
  res.status(200).send(csv);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
