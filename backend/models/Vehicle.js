import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  id: { type: String, required: true },
  severity: { type: String, required: true, enum: ['high', 'medium', 'low'] },
  type: { type: String, required: true },
  message: { type: String, required: true }
}, { _id: false });

const TelemetrySchema = new mongoose.Schema({
  temp: { type: Number, required: true },
  load: { type: String, required: true },
  pressure: { type: String, required: true }
}, { _id: false });

const VehicleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  driver: { type: String, default: 'N/A' },
  type: { type: String, required: true },
  status: { type: String, required: true, enum: ['En Route', 'Idle', 'Maintenance'] },
  fuel: { type: Number, required: true, min: 0, max: 100 },
  speed: { type: Number, required: true, min: 0 },
  location: { type: String, required: true },
  destination: { type: String, required: true },
  telemetry: { type: TelemetrySchema, required: true },
  alerts: { type: [AlertSchema], default: [] }
}, { timestamps: true });

export default mongoose.model('Vehicle', VehicleSchema);
