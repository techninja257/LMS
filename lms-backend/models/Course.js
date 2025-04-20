const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnailImage: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  status: { type: String, enum: ['Draft', 'Pending', 'Approved', 'Rejected'], default: 'Draft' },
  modules: [{
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }]
  }],
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }], // For backward compatibility
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }] // Added to reference Quiz model
});

module.exports = mongoose.model('Course', courseSchema);