#!/bin/bash

# Define base directory
BASE_DIR="lms-backend"

# Create directories
mkdir -p $BASE_DIR/{config,controllers,middleware,models,routes,utils,tests}

# Create files in config
touch $BASE_DIR/config/db.js
touch $BASE_DIR/config/config.js
touch $BASE_DIR/config/cloudStorage.js

# Create files in controllers
touch $BASE_DIR/controllers/authController.js
touch $BASE_DIR/controllers/userController.js
touch $BASE_DIR/controllers/courseController.js
touch $BASE_DIR/controllers/lessonController.js
touch $BASE_DIR/controllers/quizController.js

# Create files in middleware
touch $BASE_DIR/middleware/auth.js
touch $BASE_DIR/middleware/roleAccess.js
touch $BASE_DIR/middleware/errorHandler.js

# Create files in models
touch $BASE_DIR/models/User.js
touch $BASE_DIR/models/Course.js
touch $BASE_DIR/models/Lesson.js
touch $BASE_DIR/models/Quiz.js
touch $BASE_DIR/models/Progress.js
touch $BASE_DIR/models/Notification.js

# Create files in routes
touch $BASE_DIR/routes/authRoutes.js
touch $BASE_DIR/routes/userRoutes.js
touch $BASE_DIR/routes/courseRoutes.js
touch $BASE_DIR/routes/lessonRoutes.js
touch $BASE_DIR/routes/quizRoutes.js

# Create files in utils
touch $BASE_DIR/utils/validators.js
touch $BASE_DIR/utils/emailService.js
touch $BASE_DIR/utils/certificateGen.js

# Create root-level files
touch $BASE_DIR/.env
touch $BASE_DIR/.gitignore
touch $BASE_DIR/package.json
touch $BASE_DIR/server.js

echo "Project structure for LMS backend created successfully."
