const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  contentType: { type: String, enum: ['text', 'video', 'pdf', 'mixed'], required: true },
  content: { type: String },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId }, // Links to module._id
  requiredTimeToComplete: { type: Number, required: true },
  pageCount: { type: Number },
  order: { type: Number },
  isPublished: { type: Boolean, default: false },
  material: { type: String } // File path for uploaded material
});

module.exports = mongoose.model('Lesson', lessonSchema);