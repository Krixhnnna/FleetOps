export const INITIAL_VEHICLES = [
  { id: 'FO-101', driver: 'Marcus Vance', type: 'Semi-Truck (Class 8)', status: 'En Route', fuel: 78, speed: 62, location: 'Denver, CO', destination: 'Salt Lake City, UT', telemetry: { temp: 195, load: 'Produce (22 tons)', pressure: '110 psi' }, alerts: [] },
  { id: 'FO-102', driver: 'Sarah Connor', type: 'Delivery Van', status: 'En Route', fuel: 92, speed: 45, location: 'Seattle, WA', destination: 'Bellevue, WA', telemetry: { temp: 180, load: 'Electronics (1.2 tons)', pressure: '35 psi' }, alerts: [] },
  { id: 'FO-103', driver: 'David Miller', type: 'Box Truck', status: 'Idle', fuel: 45, speed: 0, location: 'Austin, TX', destination: 'N/A (Depot A)', telemetry: { temp: 75, load: 'Empty', pressure: '85 psi' }, alerts: [] },
  { id: 'FO-104', driver: 'Elena Rostova', type: 'Semi-Truck (Class 8)', status: 'Maintenance', fuel: 12, speed: 0, location: 'Chicago, IL', destination: 'Service Center 4', telemetry: { temp: 240, load: 'None', pressure: '90 psi' }, alerts: [{ id: 'a1', severity: 'high', type: 'Engine Overheat', message: 'Coolant temperature above threshold (240°F)' }] },
  { id: 'FO-105', driver: 'Alex Mercer', type: 'Delivery Van', status: 'En Route', fuel: 55, speed: 38, location: 'New York, NY', destination: 'Brooklyn, NY', telemetry: { temp: 185, load: 'Parcels (0.8 tons)', pressure: '34 psi' }, alerts: [] },
  { id: 'FO-106', driver: 'James Wilson', type: 'Box Truck', status: 'En Route', fuel: 64, speed: 52, location: 'Atlanta, GA', destination: 'Savannah, GA', telemetry: { temp: 190, load: 'Furniture (4.5 tons)', pressure: '88 psi' }, alerts: [] },
  { id: 'FO-107', driver: 'Lisa Chang', type: 'Semi-Truck (Class 8)', status: 'Idle', fuel: 89, speed: 0, location: 'Los Angeles, CA', destination: 'N/A (Depot C)', telemetry: { temp: 80, load: 'Empty', pressure: '108 psi' }, alerts: [] },
  { id: 'FO-108', driver: 'Robert Chen', type: 'Flatbed Truck', status: 'Maintenance', fuel: 34, speed: 0, location: 'Phoenix, AZ', destination: 'Maintenance Yard B', telemetry: { temp: 120, load: 'Steel Rails (12 tons)', pressure: '95 psi' }, alerts: [{ id: 'a2', severity: 'medium', type: 'Brake Wear', message: 'Rear brake pads at 15% life' }] }
];

export const INITIAL_LOGS = [
  { id: 1, timestamp: '11:40 AM', vehicleId: 'FO-102', event: 'Status updated to En Route', type: 'info' },
  { id: 2, timestamp: '11:35 AM', vehicleId: 'FO-104', event: 'High engine temperature warning detected', type: 'warning' },
  { id: 3, timestamp: '11:20 AM', vehicleId: 'FO-108', event: 'Scheduled maintenance check-in', type: 'info' },
  { id: 4, timestamp: '11:05 AM', vehicleId: 'FO-103', event: 'Arrived at Austin Depot A', type: 'success' }
];
