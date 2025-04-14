const mongoose = require('mongoose');
const slugify = require('slugify');

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a course title'],
      trim: true,
      maxlength: [100, 'Course title cannot be more than 100 characters']
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    summary: {
      type: String,
      maxlength: [500, 'Summary cannot be more than 500 characters']
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other'
      ]
    },
    level: {
      type: String,
      required: [true, 'Please add a difficulty level'],
      enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    coverImage: {
      type: String,
      default: 'default-course.jpg'
    },
    duration: {
      type: Number,
      required: [true, 'Please add course duration in weeks']
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    requiresApproval: {
      type: Boolean,
      default: true
    },
    price: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create course slug from title
CourseSchema.pre('save', function(next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// Cascade delete lessons, quizzes, and enrollments when a course is deleted
CourseSchema.pre('remove', async function(next) {
  console.log(`Removing lessons, quizzes, and enrollments for course: ${this._id}`);
  await this.model('Lesson').deleteMany({ course: this._id });
  await this.model('Quiz').deleteMany({ course: this._id });
  await this.model('Enrollment').deleteMany({ course: this._id });
  next();
});

// Virtual field for lessons
CourseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Virtual field for quizzes
CourseSchema.virtual('quizzes', {
  ref: 'Quiz',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Virtual field for enrollments
CourseSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Static method to get average rating
CourseSchema.statics.getAverageRating = async function(courseId) {
  const obj = await this.model('Review').aggregate([
    {
      $match: { course: courseId }
    },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    await this.findByIdAndUpdate(courseId, {
      averageRating: obj.length > 0 ? Math.round(obj[0].averageRating * 10) / 10 : 0
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = mongoose.model('Course', CourseSchema);