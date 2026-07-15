import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  timestamp: { type: String, required: true },
  vehicleId: { type: String, required: true },
  event: { type: String, required: true },
  type: { type: String, default: 'info', enum: ['info', 'warning', 'success'] }
}, { timestamps: true });

export default mongoose.model('Log', LogSchema);
