require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB for seeding...');

  await User.deleteMany();
  await Course.deleteMany();
  await Enrollment.deleteMany();
  await Progress.deleteMany();
  await Certificate.deleteMany();

  // Admin
  const admin = await User.create({
    name: 'Admin User', email: 'admin@edupro.com',
    password: 'admin123', role: 'admin', isActive: true,
  });

  // Instructors
  const instructor1 = await User.create({
    name: 'Dr. Priya Sharma', email: 'priya@edupro.com',
    password: 'instructor123', role: 'instructor',
    bio: 'Senior React Developer with 8 years experience.',
    expertise: ['React', 'JavaScript'], isVerified: true,
  });

  const instructor2 = await User.create({
    name: 'Amit Singh', email: 'amit@edupro.com',
    password: 'instructor123', role: 'instructor',
    bio: 'Backend engineer specializing in Node.js and MongoDB.',
    expertise: ['Node.js', 'MongoDB'], isVerified: true,
  });

  const instructor3 = await User.create({
    name: 'Sneha Joshi', email: 'sneha@edupro.com',
    password: 'instructor123', role: 'instructor',
    bio: 'UI/UX designer and frontend developer.',
    expertise: ['HTML', 'CSS', 'Design'], isVerified: true,
  });

  // Student
  const student = await User.create({
    name: 'Rahul Kumar', email: 'student@edupro.com',
    password: 'student123', role: 'student',
  });

  // ─────────────────────────────────────────
  // PAID COURSES
  // ─────────────────────────────────────────
  const reactCourse = await Course.create({
    title: 'React Mastery',
    description: 'Complete React course from beginner to advanced. Learn Hooks, Context API, React Router, and build real-world projects.',
    instructor: instructor1._id, instructorName: instructor1.name,
    category: 'Frontend', level: 'Intermediate',
    price: 999, isPremium: true, isPublished: true,
    tags: ['React', 'JavaScript', 'Frontend'],
    whatYouLearn: ['React Hooks', 'Context API', 'React Router', 'Performance Optimization'],
    prerequisites: ['Basic JavaScript', 'HTML/CSS'],
    modules: [
      {
        title: 'Getting Started with React', order: 0,
        lectures: [
          { title: 'What is React and Why Use It?', videoUrl: '', duration: 12, order: 0, description: 'Introduction to React ecosystem' },
          { title: 'Setting Up Development Environment', videoUrl: '', duration: 15, order: 1, description: 'Install Node, VS Code, and create-react-app' },
          { title: 'Your First React Component', videoUrl: '', duration: 18, order: 2, description: 'JSX syntax and functional components' },
          { title: 'Props and Component Communication', videoUrl: '', duration: 20, order: 3, description: 'Passing data between components' },
          { title: 'State with useState Hook', videoUrl: '', duration: 22, order: 4, description: 'Managing component state' },
        ],
      },
      {
        title: 'React Hooks Deep Dive', order: 1,
        lectures: [
          { title: 'useEffect Hook Explained', videoUrl: '', duration: 25, order: 0, description: 'Side effects and lifecycle in functional components' },
          { title: 'useContext for Global State', videoUrl: '', duration: 20, order: 1, description: 'Sharing state across components without prop drilling' },
          { title: 'useRef and DOM Manipulation', videoUrl: '', duration: 15, order: 2, description: 'Direct DOM access with useRef' },
          { title: 'Custom Hooks', videoUrl: '', duration: 28, order: 3, description: 'Building reusable logic with custom hooks' },
        ],
      },
    ],
  });

  await Course.create({
    title: 'Node.js & Express Mastery',
    description: 'Build scalable REST APIs with Node.js and Express. Learn middleware, authentication, file uploads and MongoDB integration.',
    instructor: instructor2._id, instructorName: instructor2.name,
    category: 'Backend', level: 'Intermediate',
    price: 1499, isPremium: true, isPublished: true,
    tags: ['Node.js', 'Express', 'Backend', 'API'],
    whatYouLearn: ['REST APIs', 'JWT Auth', 'MongoDB', 'File Uploads'],
    prerequisites: ['Basic JavaScript'],
    modules: [
      {
        title: 'Node.js Fundamentals', order: 0,
        lectures: [
          { title: 'Node.js Introduction & Setup', videoUrl: '', duration: 14, order: 0 },
          { title: 'Modules and require()', videoUrl: '', duration: 16, order: 1 },
          { title: 'Async JavaScript & Promises', videoUrl: '', duration: 22, order: 2 },
          { title: 'File System Operations', videoUrl: '', duration: 18, order: 3 },
          { title: 'Building HTTP Server', videoUrl: '', duration: 20, order: 4 },
        ],
      },
      {
        title: 'Express.js & REST APIs', order: 1,
        lectures: [
          { title: 'Express Setup & Routing', videoUrl: '', duration: 20, order: 0 },
          { title: 'Middleware Explained', videoUrl: '', duration: 18, order: 1 },
          { title: 'JWT Authentication', videoUrl: '', duration: 30, order: 2 },
          { title: 'Multer File Uploads', videoUrl: '', duration: 22, order: 3 },
        ],
      },
    ],
  });

  await Course.create({
    title: 'Python for Machine Learning',
    description: 'Master machine learning with Python. Covers NumPy, Pandas, Scikit-learn and real ML projects.',
    instructor: admin._id, instructorName: 'Dr. Neha Gupta',
    category: 'AI/ML', level: 'Advanced',
    price: 1999, isPremium: true, isPublished: true,
    tags: ['Python', 'ML', 'AI', 'Data Science'],
    modules: [
      {
        title: 'Python & Data Science Basics', order: 0,
        lectures: [
          { title: 'Python Refresher', videoUrl: '', duration: 20, order: 0 },
          { title: 'NumPy Arrays & Operations', videoUrl: '', duration: 25, order: 1 },
          { title: 'Pandas DataFrames', videoUrl: '', duration: 28, order: 2 },
          { title: 'Data Visualization with Matplotlib', videoUrl: '', duration: 22, order: 3 },
          { title: 'Data Cleaning Techniques', videoUrl: '', duration: 30, order: 4 },
        ],
      },
    ],
  });

  // ─────────────────────────────────────────
  // FREE COURSES (with 4-5 lectures each)
  // ─────────────────────────────────────────
  const htmlCourse = await Course.create({
    title: 'HTML & CSS for Beginners',
    description: 'Learn HTML and CSS from scratch. Build your first webpage, understand layouts, flexbox, and responsive design. Completely FREE!',
    instructor: instructor3._id, instructorName: instructor3.name,
    category: 'Frontend', level: 'Beginner',
    price: 0, isPremium: false, isPublished: true,
    tags: ['HTML', 'CSS', 'Web', 'Beginner', 'Free'],
    whatYouLearn: ['HTML structure', 'CSS styling', 'Flexbox layout', 'Responsive design', 'Build real webpage'],
    prerequisites: ['No experience needed!'],
    modules: [
      {
        title: 'HTML Fundamentals', order: 0,
        lectures: [
          { title: 'What is HTML? Your First Webpage', videoUrl: 'https://www.youtube.com/watch?v=qz0aGYrrlhU', duration: 10, order: 0, description: 'Introduction to HTML tags and structure' },
          { title: 'HTML Tags — Headings, Paragraphs, Links', videoUrl: 'https://www.youtube.com/watch?v=PlxWf493en4', duration: 14, order: 1, description: 'Learn the most common HTML elements' },
          { title: 'HTML Forms & Input Elements', videoUrl: 'https://www.youtube.com/watch?v=2O8pkybH6po', duration: 16, order: 2, description: 'Creating forms for user input' },
          { title: 'HTML Lists, Tables & Media', videoUrl: 'https://www.youtube.com/watch?v=H2kTzmJJ79E', duration: 14, order: 3, description: 'Lists, tables, images and videos in HTML' },
          { title: 'Semantic HTML — Best Practices', videoUrl: 'https://www.youtube.com/watch?v=kGW8Al_cga4', duration: 12, order: 4, description: 'Writing clean, accessible HTML' },
        ],
      },
      {
        title: 'CSS Styling & Layouts', order: 1,
        lectures: [
          { title: 'CSS Basics — Colors, Fonts, Borders', videoUrl: 'https://www.youtube.com/watch?v=1PnVor36_40', duration: 16, order: 0, description: 'Styling HTML with CSS properties' },
          { title: 'Box Model & Spacing', videoUrl: 'https://www.youtube.com/watch?v=rIO5326FgPE', duration: 14, order: 1, description: 'Margin, padding, border explained' },
          { title: 'Flexbox Layout', videoUrl: 'https://www.youtube.com/watch?v=3YW65K6LcIA', duration: 20, order: 2, description: 'Build modern layouts with Flexbox' },
          { title: 'Responsive Design & Media Queries', videoUrl: 'https://www.youtube.com/watch?v=bn-DQznj10M', duration: 18, order: 3, description: 'Make your website mobile-friendly' },
          { title: 'Mini Project — Build a Portfolio Page', videoUrl: 'https://www.youtube.com/watch?v=oYRda7UtuhA', duration: 25, order: 4, description: 'Apply everything you learned in a real project' },
        ],
      },
    ],
  });

  const gitCourse = await Course.create({
    title: 'Git & GitHub Complete Guide',
    description: 'Learn version control with Git and GitHub. From basic commands to branching, merging, and open source collaboration. FREE!',
    instructor: instructor2._id, instructorName: instructor2.name,
    category: 'DevOps', level: 'Beginner',
    price: 0, isPremium: false, isPublished: true,
    tags: ['Git', 'GitHub', 'Version Control', 'Free'],
    whatYouLearn: ['Git basics', 'Branching & merging', 'GitHub workflow', 'Open source contribution'],
    prerequisites: ['Basic computer knowledge'],
    modules: [
      {
        title: 'Git Basics', order: 0,
        lectures: [
          { title: 'What is Git & Why Developers Use It', videoUrl: 'https://www.youtube.com/watch?v=2ReR1YJrNOM', duration: 10, order: 0, description: 'Version control explained simply' },
          { title: 'Installing Git & First Configuration', videoUrl: 'https://www.youtube.com/watch?v=USjZcfj8yxE', duration: 12, order: 1, description: 'Setup Git on Windows/Mac/Linux' },
          { title: 'git init, add, commit — Core Workflow', videoUrl: 'https://www.youtube.com/watch?v=evknSAkUIvs', duration: 18, order: 2, description: 'The 3 commands you will use daily' },
          { title: 'Branching & Merging', videoUrl: 'https://www.youtube.com/watch?v=S2TUommS3O0', duration: 20, order: 3, description: 'Work on features without breaking main code' },
          { title: 'Resolving Merge Conflicts', videoUrl: 'https://www.youtube.com/watch?v=xNVM5UxlFSA', duration: 16, order: 4, description: 'Handle conflicts like a pro' },
        ],
      },
      {
        title: 'GitHub & Collaboration', order: 1,
        lectures: [
          { title: 'GitHub Account Setup & Repositories', videoUrl: 'https://www.youtube.com/watch?v=iv8rSLsi1xo', duration: 12, order: 0 },
          { title: 'Push & Pull — Remote Repositories', videoUrl: 'https://www.youtube.com/watch?v=zgA7-_--TSo', duration: 15, order: 1 },
          { title: 'Pull Requests & Code Review', videoUrl: 'https://www.youtube.com/watch?v=For9VtrQx58', duration: 18, order: 2 },
          { title: 'Contributing to Open Source', videoUrl: 'https://www.youtube.com/watch?v=yzeVMecydCE', duration: 20, order: 3 },
        ],
      },
    ],
  });

  const jsCourse = await Course.create({
    title: 'JavaScript Fundamentals — Free',
    description: 'Complete JavaScript basics course. Variables, functions, arrays, objects, DOM manipulation and modern ES6+ features. 100% FREE!',
    instructor: instructor1._id, instructorName: instructor1.name,
    category: 'Frontend', level: 'Beginner',
    price: 0, isPremium: false, isPublished: true,
    tags: ['JavaScript', 'JS', 'Web', 'Beginner', 'Free'],
    whatYouLearn: ['Variables & data types', 'Functions & scope', 'Arrays & objects', 'DOM manipulation', 'ES6+ features'],
    prerequisites: ['Basic HTML knowledge'],
    modules: [
      {
        title: 'JavaScript Basics', order: 0,
        lectures: [
          { title: 'Introduction to JavaScript', videoUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c', duration: 12, order: 0, description: 'What is JS and how browsers run it' },
          { title: 'Variables — var, let, const', videoUrl: 'https://www.youtube.com/watch?v=9WIJQDvt4Us', duration: 15, order: 1, description: 'Declaring and using variables' },
          { title: 'Functions & Scope', videoUrl: 'https://www.youtube.com/watch?v=xUI5Tsl2JpY', duration: 20, order: 2, description: 'Writing reusable code with functions' },
          { title: 'Arrays & Array Methods', videoUrl: 'https://www.youtube.com/watch?v=oigfaZ5ApsM', duration: 22, order: 3, description: 'map, filter, reduce and more' },
          { title: 'Objects & JSON', videoUrl: 'https://www.youtube.com/watch?v=_5jdE6impos', duration: 18, order: 4, description: 'Working with key-value data' },
        ],
      },
      {
        title: 'DOM & ES6+', order: 1,
        lectures: [
          { title: 'DOM Manipulation', videoUrl: 'https://www.youtube.com/watch?v=5fb2aPlgoys', duration: 20, order: 0, description: 'Change HTML with JavaScript' },
          { title: 'Event Listeners', videoUrl: 'https://www.youtube.com/watch?v=XF1_MlZ5l6M', duration: 16, order: 1, description: 'React to user interactions' },
          { title: 'ES6 Arrow Functions & Destructuring', videoUrl: 'https://www.youtube.com/watch?v=InjFB4_MNsU', duration: 18, order: 2 },
          { title: 'Promises & Async/Await', videoUrl: 'https://www.youtube.com/watch?v=V_Kr9OSfDeU', duration: 25, order: 3 },
          { title: 'Mini Project — To-Do App', videoUrl: 'https://www.youtube.com/watch?v=G0jO8kUrg-I', duration: 30, order: 4, description: 'Build a complete To-Do app with JS' },
        ],
      },
    ],
  });

  // ─────────────────────────────────────────
  // Enroll student in HTML & CSS (free) and complete it → certificate
  // ─────────────────────────────────────────
  await Enrollment.create({ student: student._id, course: htmlCourse._id, isCompleted: true, completedAt: new Date() });
  await User.findByIdAndUpdate(student._id, { $push: { enrolledCourses: htmlCourse._id } });

  // Count total lectures for HTML course
  const totalLectures = htmlCourse.modules.reduce((a, m) => a + m.lectures.length, 0);
  const allLectureIds = htmlCourse.modules.flatMap(m => m.lectures.map(l => l._id.toString()));

  await Progress.create({
    student: student._id,
    course: htmlCourse._id,
    completedLectures: allLectureIds,
    completionPercentage: 100,
    lastAccessedAt: new Date(),
  });

  // Generate certificate for completed course
  await Certificate.create({
    student: student._id,
    course: htmlCourse._id,
    studentName: student.name,
    courseName: htmlCourse.title,
    instructorName: htmlCourse.instructorName,
    completionDate: new Date(),
    uniqueId: `CERT-${Date.now()}-HTMLCSS`,
  });

  await User.findByIdAndUpdate(student._id, {
    $push: { completedCourses: htmlCourse._id }
  });

  // Update course enrolled count
  await Course.findByIdAndUpdate(htmlCourse._id, { enrolledCount: 1 });
  await Course.findByIdAndUpdate(reactCourse._id, { enrolledCount: 45 });
  await Course.findByIdAndUpdate(gitCourse._id, { enrolledCount: 120 });
  await Course.findByIdAndUpdate(jsCourse._id, { enrolledCount: 89 });

  console.log('\n✅ Seed complete!\n');
  console.log('👤 Admin:       admin@edupro.com      / admin123');
  console.log('🎓 Instructor:  priya@edupro.com      / instructor123');
  console.log('🎓 Instructor:  amit@edupro.com       / instructor123');
  console.log('🎓 Instructor:  sneha@edupro.com      / instructor123');
  console.log('📚 Student:     student@edupro.com    / student123');
  console.log('\n📦 Courses created:');
  console.log('   💰 Paid: React Mastery, Node.js Mastery, Python ML');
  console.log('   🆓 Free: HTML & CSS, Git & GitHub, JavaScript Fundamentals');
  console.log('\n🏆 Certificate pre-generated for: HTML & CSS for Beginners');

  mongoose.disconnect();
};

seed().catch(err => { console.error(err); mongoose.disconnect(); });
