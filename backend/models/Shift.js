import mongoose from 'mongoose';

const ShiftSchema = new mongoose.Schema({
  id: { type: String, default: () => Date.now().toString(), unique: true },
  driverName: { type: String, required: true },
  vehicleId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, default: null },
  status: { type: String, required: true, enum: ['Active', 'Completed'] }
}, { timestamps: true });

export default mongoose.model('Shift', ShiftSchema);
