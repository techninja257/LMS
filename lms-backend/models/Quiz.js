const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a quiz title'],
    trim: true,
    maxlength: [100, 'Quiz title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson'
  },
  questions: [
    {
      questionText: {
        type: String,
        required: [true, 'Please add a question']
      },
      questionType: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'fill-in-blank'],
        default: 'multiple-choice'
      },
      options: [String],
      correctAnswer: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      points: {
        type: Number,
        default: 1
      }
    }
  ],
  timeLimit: {
    type: Number, // in minutes
    default: 0 // 0 means no time limit
  },
  passingScore: {
    type: Number, // percentage
    default: 70
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  allowRetake: {
    type: Boolean,
    default: true
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-populate course field
QuizSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'course',
    select: 'title slug'
  });
  
  next();
});

// Update the updatedAt timestamp on save
QuizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total points available in the quiz
QuizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
});

module.exports = mongoose.model('Quiz', QuizSchema);