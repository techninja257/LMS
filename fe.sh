#!/bin/bash

# Define base directory
BASE_DIR="lms-frontend"

# Create directory structure
mkdir -p $BASE_DIR/public/assets/images
mkdir -p $BASE_DIR/src/api
mkdir -p $BASE_DIR/src/components/{common,layout,auth,course,lesson,quiz}
mkdir -p $BASE_DIR/src/contexts
mkdir -p $BASE_DIR/src/hooks
mkdir -p $BASE_DIR/src/pages
mkdir -p $BASE_DIR/src/utils

# Create public files
touch $BASE_DIR/public/index.html
touch $BASE_DIR/public/favicon.ico

# Create API service layer files
touch $BASE_DIR/src/api/{auth.js,courses.js,lessons.js,quizzes.js,user.js}

# Create common components
touch $BASE_DIR/src/components/common/{Button.jsx,Card.jsx,Modal.jsx}

# Create layout components
touch $BASE_DIR/src/components/layout/{Footer.jsx,Header.jsx,Sidebar.jsx}

# Create auth components
touch $BASE_DIR/src/components/auth/{LoginForm.jsx,RegisterForm.jsx}

# Create course components
touch $BASE_DIR/src/components/course/{CourseCard.jsx,CourseList.jsx}

# Create lesson components
touch $BASE_DIR/src/components/lesson/{LessonItem.jsx,LessonList.jsx}

# Create quiz components
touch $BASE_DIR/src/components/quiz/{QuizForm.jsx,QuestionItem.jsx}

# Create context files
touch $BASE_DIR/src/contexts/{AuthContext.jsx,CourseContext.jsx}

# Create hooks
touch $BASE_DIR/src/hooks/{useAuth.js,useFetch.js}

# Create page components
touch $BASE_DIR/src/pages/{Home.jsx,Login.jsx,Register.jsx,Profile.jsx,Courses.jsx,CourseDetail.jsx,Dashboard.jsx}

# Create utility files
touch $BASE_DIR/src/utils/{helpers.js,formatters.js}

# Create root-level frontend files
touch $BASE_DIR/src/{App.jsx,index.jsx,routes.jsx}
touch $BASE_DIR/.env
touch $BASE_DIR/package.json
touch $BASE_DIR/tailwind.config.js

echo "Project structure for LMS frontend created successfully."

