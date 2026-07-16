import mongoose from 'mongoose';

const IncidentSchema = new mongoose.Schema({
  id: { type: String, default: () => Date.now().toString(), unique: true },
  vehicleId: { type: String, required: true },
  driverName: { type: String, default: 'Unknown' },
  type: { type: String, required: true },
  severity: { type: String, required: true },
  location: { type: String, default: 'Unknown' },
  description: { type: String, required: true },
  timestamp: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model('Incident', IncidentSchema);
