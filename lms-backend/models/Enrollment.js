const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
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
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completionDate: {
    type: Date
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped'],
    default: 'active'
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: {
    type: String
  },
  quizScores: [{
    quiz: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quiz'
    },
    score: Number,
    maxScore: Number,
    attemptDate: {
      type: Date,
      default: Date.now
    },
    passed: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure a user can only enroll once in a course
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Update lastAccessedAt whenever the document is saved
EnrollmentSchema.pre('save', function(next) {
  this.lastAccessedAt = Date.now();
  
  // If completionPercentage is 100 and status is not completed yet, update it
  if (this.completionPercentage === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completionDate = Date.now();
  }
  
  next();
});

// Auto-populate user and course fields
EnrollmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email'
  }).populate({
    path: 'course',
    select: 'title description category level'
  });
  
  next();
});

// Virtual for progress records related to this enrollment
EnrollmentSchema.virtual('progressRecords', {
  ref: 'Progress',
  localField: 'user',
  foreignField: 'user',
  justOne: false,
  match: function() {
    return { course: this.course };
  }
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);