import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'manager', 'driver'] }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
