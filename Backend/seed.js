const mongoose = require('mongoose');
const ProjectIdea = require('./Model/ProjectIdea');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project_ideas';

const sampleProjects = [
  // IT Faculty Projects
  {
    title: 'AI-Powered Student Attendance System',
    description: 'A facial recognition-based attendance system for universities using machine learning algorithms to automatically mark attendance.',
    faculty: 'IT',
    category: 'AI',
    difficulty: 'Hard',
    tags: ['AI', 'Machine Learning', 'Facial Recognition', 'Python', 'OpenCV'],
    status: 'Approved',
    author: 'Dr. Smith'
  },
  {
    title: 'University Library Management System',
    description: 'A web-based system to manage library resources, book borrowing, returns, and student records.',
    faculty: 'IT',
    category: 'Web',
    difficulty: 'Medium',
    tags: ['Web', 'Database', 'Node.js', 'React', 'MongoDB'],
    status: 'New',
    author: 'Prof. Johnson'
  },
  {
    title: 'Campus Navigation Mobile App',
    description: 'An Android/iOS app that helps new students navigate the university campus with indoor maps and directions.',
    faculty: 'IT',
    category: 'Mobile',
    difficulty: 'Medium',
    tags: ['Mobile', 'Android', 'iOS', 'GPS', 'Maps'],
    status: 'New',
    author: 'Ms. Davis'
  },
  {
    title: 'Smart Home IoT System',
    description: 'An IoT-based home automation system controlling lights, temperature, and security using sensors and microcontrollers.',
    faculty: 'IT',
    category: 'IoT',
    difficulty: 'Hard',
    tags: ['IoT', 'Arduino', 'Sensors', 'Automation', 'Embedded'],
    status: 'Approved',
    author: 'Dr. Wilson'
  },
  {
    title: 'Personal Portfolio Website',
    description: 'A simple portfolio website template for students to showcase their projects and skills.',
    faculty: 'IT',
    category: 'Web',
    difficulty: 'Easy',
    tags: ['Web', 'HTML', 'CSS', 'JavaScript', 'Portfolio'],
    status: 'Completed',
    author: 'Mr. Brown'
  },

  // SE Faculty Projects
  {
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce website with product catalog, shopping cart, payment integration, and order management.',
    faculty: 'SE',
    category: 'Web',
    difficulty: 'Hard',
    tags: ['E-commerce', 'Full Stack', 'Payment', 'React', 'Node.js'],
    status: 'Approved',
    author: 'Prof. Anderson'
  },
  {
    title: 'Task Management Application',
    description: 'A project management tool for teams to collaborate, assign tasks, and track progress.',
    faculty: 'SE',
    category: 'Web',
    difficulty: 'Medium',
    tags: ['Project Management', 'Collaboration', 'Agile', 'React', 'Firebase'],
    status: 'New',
    author: 'Dr. Martinez'
  },
  {
    title: 'Online Quiz System',
    description: 'A web application for creating and taking quizzes with automatic grading and result analytics.',
    faculty: 'SE',
    category: 'Web',
    difficulty: 'Easy',
    tags: ['Quiz', 'Education', 'Assessment', 'JavaScript', 'Database'],
    status: 'Completed',
    author: 'Ms. Taylor'
  },
  {
    title: 'Food Delivery App',
    description: 'A mobile application connecting restaurants with customers for food ordering and delivery tracking.',
    faculty: 'SE',
    category: 'Mobile',
    difficulty: 'Hard',
    tags: ['Mobile', 'Food Delivery', 'GPS', 'Payment', 'Flutter'],
    status: 'New',
    author: 'Mr. Thomas'
  },

  // Data Science Faculty Projects
  {
    title: 'Student Performance Prediction',
    description: 'A machine learning model to predict student academic performance based on various factors.',
    faculty: 'Data Science',
    category: 'AI',
    difficulty: 'Hard',
    tags: ['Machine Learning', 'Prediction', 'Python', 'Pandas', 'Scikit-learn'],
    status: 'Approved',
    author: 'Dr. Garcia'
  },
  {
    title: 'Sales Data Visualization Dashboard',
    description: 'An interactive dashboard for visualizing and analyzing sales data with charts and reports.',
    faculty: 'Data Science',
    category: 'Data Science',
    difficulty: 'Medium',
    tags: ['Data Visualization', 'Dashboard', 'D3.js', 'Analytics', 'Charts'],
    status: 'New',
    author: 'Prof. Lee'
  },
  {
    title: 'Sentiment Analysis Tool',
    description: 'A tool that analyzes social media comments to determine public sentiment about products or topics.',
    faculty: 'Data Science',
    category: 'AI',
    difficulty: 'Medium',
    tags: ['NLP', 'Sentiment Analysis', 'Python', 'Text Mining', 'Twitter API'],
    status: 'Approved',
    author: 'Dr. White'
  },
  {
    title: 'Customer Segmentation Analysis',
    description: 'Using clustering algorithms to segment customers based on purchasing behavior for targeted marketing.',
    faculty: 'Data Science',
    category: 'Data Science',
    difficulty: 'Medium',
    tags: ['Clustering', 'K-means', 'Marketing', 'Python', 'Analytics'],
    status: 'New',
    author: 'Ms. Clark'
  },

  // Cyber Security Faculty Projects
  {
    title: 'Network Intrusion Detection System',
    description: 'A system that monitors network traffic and detects suspicious activities or potential attacks.',
    faculty: 'Cyber',
    category: 'Cyber Security',
    difficulty: 'Hard',
    tags: ['Security', 'Network', 'IDS', 'Python', 'Machine Learning'],
    status: 'Approved',
    author: 'Dr. Harris'
  },
  {
    title: 'Password Strength Analyzer',
    description: 'A tool that evaluates password strength and provides recommendations for better security.',
    faculty: 'Cyber',
    category: 'Cyber Security',
    difficulty: 'Easy',
    tags: ['Security', 'Password', 'Encryption', 'JavaScript', 'Web'],
    status: 'Completed',
    author: 'Prof. Lewis'
  },
  {
    title: 'Phishing Website Detector',
    description: 'A browser extension that identifies and warns users about phishing websites.',
    faculty: 'Cyber',
    category: 'Cyber Security',
    difficulty: 'Medium',
    tags: ['Security', 'Phishing', 'Browser Extension', 'ML', 'Web'],
    status: 'New',
    author: 'Mr. Walker'
  },
  {
    title: 'Secure File Sharing System',
    description: 'An encrypted file sharing platform with access control and audit logging.',
    faculty: 'Cyber',
    category: 'Cyber Security',
    difficulty: 'Hard',
    tags: ['Security', 'Encryption', 'File Sharing', 'Node.js', 'Cryptography'],
    status: 'Approved',
    author: 'Dr. Hall'
  },

  // Network Faculty Projects
  {
    title: 'Campus Network Monitoring Tool',
    description: 'A tool to monitor network performance, bandwidth usage, and device connectivity across campus.',
    faculty: 'Network',
    category: 'Networking',
    difficulty: 'Medium',
    tags: ['Network', 'Monitoring', 'SNMP', 'Python', 'Dashboard'],
    status: 'New',
    author: 'Prof. Allen'
  },
  {
    title: 'SDN-Based Traffic Management',
    description: 'Software-Defined Networking solution for optimizing network traffic flow in enterprise environments.',
    faculty: 'Network',
    category: 'Networking',
    difficulty: 'Hard',
    tags: ['SDN', 'Networking', 'Traffic Management', 'Mininet', 'OpenFlow'],
    status: 'Approved',
    author: 'Dr. Young'
  },
  {
    title: 'Wi-Fi Heatmap Generator',
    description: 'A tool that creates visual heatmaps of Wi-Fi signal strength across buildings.',
    faculty: 'Network',
    category: 'Networking',
    difficulty: 'Medium',
    tags: ['Wi-Fi', 'Heatmap', 'Signal Strength', 'Python', 'Visualization'],
    status: 'New',
    author: 'Ms. King'
  },
  {
    title: 'VPN Configuration Manager',
    description: 'A web interface for managing VPN configurations and user access for remote workers.',
    faculty: 'Network',
    category: 'Networking',
    difficulty: 'Easy',
    tags: ['VPN', 'Network Security', 'Web', 'Configuration', 'Remote Access'],
    status: 'Completed',
    author: 'Mr. Wright'
  },
  {
    title: 'Cloud Storage Solution',
    description: 'A private cloud storage system for secure file storage and sharing within the organization.',
    faculty: 'Network',
    category: 'Cloud',
    difficulty: 'Hard',
    tags: ['Cloud', 'Storage', 'AWS', 'Docker', 'Microservices'],
    status: 'Approved',
    author: 'Dr. Lopez'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await ProjectIdea.deleteMany({});
    console.log('Cleared existing project ideas');

    // Insert sample data
    const result = await ProjectIdea.insertMany(sampleProjects);
    console.log(`Successfully inserted ${result.length} project ideas`);

    // Show summary by faculty
    const facultySummary = await ProjectIdea.aggregate([
      { $group: { _id: '$faculty', count: { $sum: 1 } } }
    ]);
    console.log('\nProjects by Faculty:');
    facultySummary.forEach(item => {
      console.log(`  ${item._id}: ${item.count} projects`);
    });

    console.log('\nSeeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
