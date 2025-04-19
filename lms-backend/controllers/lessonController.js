const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

const createLesson = async (req, res) => {
  try {
    const { title, description, contentType, content, requiredTimeToComplete, pageCount, order, moduleId } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const lesson = new Lesson({
      title,
      description,
      contentType,
      content,
      courseId: req.params.courseId,
      moduleId,
      requiredTimeToComplete,
      pageCount,
      order,
      isPublished: false
    });
    await lesson.save();

    if (moduleId) {
      const module = course.modules.id(moduleId);
      if (!module) return res.status(404).json({ message: 'Module not found' });
      module.lessons.push(lesson._id);
    } else {
      course.lessons.push(lesson._id);
    }
    await course.save();

    res.status(201).json(lesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ message: error.message });
  }
};

const uploadMaterial = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    const course = await Course.findById(lesson.courseId);
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    lesson.material = req.file.path;
    await lesson.save();
    res.status(200).json({ message: 'Material uploaded successfully', material: req.file.path });
  } catch (error) {
    console.error('Error uploading material:', error);
    res.status(500).json({ message: error.message });
  }
};

const getCourseLessons = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate({
      path: 'modules.lessons',
      model: 'Lesson'
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const lessons = course.modules.flatMap(module => module.lessons);
    res.status(200).json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: error.message });
  }
};

const completeLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    // Placeholder: Update user progress (e.g., in User model) in a real implementation
    res.status(200).json({ message: 'Lesson marked as complete', lesson });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({ message: error.message });
  }
};

// Log to verify exports
console.log('Exporting lessonController:', {
  createLesson: typeof createLesson,
  uploadMaterial: typeof uploadMaterial,
  getCourseLessons: typeof getCourseLessons,
  completeLesson: typeof completeLesson
});

module.exports = {
  createLesson,
  uploadMaterial,
  getCourseLessons,
  completeLesson
};