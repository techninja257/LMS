const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
    trim: true,
    maxlength: [100, 'Lesson title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Please add lesson content']
  },
  contentType: {
    type: String,
    enum: ['text', 'video', 'pdf', 'mixed'],
    default: 'text'
  },
  video: {
    url: String,
    duration: Number // in minutes
  },
  pdf: {
    url: String,
    pageCount: Number
  },
  order: {
    type: Number,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  requiredTimeToComplete: {
    type: Number, // in minutes
    default: 30
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Make sure lessons within a course have unique order
LessonSchema.index({ course: 1, order: 1 }, { unique: true });

// Auto-populate course field
LessonSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'course',
    select: 'title slug'
  });
  
  next();
});

// Update the updatedAt timestamp on save
LessonSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual field for user progress (to be populated)
LessonSchema.virtual('progress', {
  ref: 'Progress',
  localField: '_id',
  foreignField: 'lesson',
  justOne: false
});

module.exports = mongoose.model('Lesson', LessonSchema);