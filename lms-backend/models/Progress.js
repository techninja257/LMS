const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson',
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  completionDate: {
    type: Date
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can have only one progress entry per lesson
ProgressSchema.index({ user: 1, course: 1, lesson: 1 }, { unique: true });

// Update lastAccessedAt on save
ProgressSchema.pre('save', function(next) {
  this.lastAccessedAt = Date.now();
  
  // If status is changed to completed, set completionDate
  if (this.isModified('status') && this.status === 'completed' && !this.completionDate) {
    this.completionDate = Date.now();
  }
  
  next();
});

// Update Course completion percentage after saving progress
ProgressSchema.post('save', async function() {
  try {
    // Get total lessons in course
    const lessonCount = await mongoose.model('Lesson').countDocuments({ course: this.course });
    
    // Get completed lessons for this user and course
    const completedCount = await mongoose.model('Progress').countDocuments({
      user: this.user,
      course: this.course,
      status: 'completed'
    });
    
    // Calculate completion percentage
    const completionPercentage = lessonCount > 0 
      ? Math.round((completedCount / lessonCount) * 100) 
      : 0;
    
    // Update enrollment record with new completion percentage
    await mongoose.model('Enrollment').findOneAndUpdate(
      { user: this.user, course: this.course },
      { completionPercentage }
    );
  } catch (err) {
    console.error('Error updating course completion percentage:', err);
  }
});

module.exports = mongoose.model('Progress', ProgressSchema);