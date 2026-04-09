const projects = [
  { title: 'Attendance Risk Prediction Model', category: 'AI & ML', createdDate: '2025-08-14', contributions: 38, likes: 54, views: 620, responses: 11 },
  { title: 'Faculty Timetable Optimizer', category: 'AI & ML', createdDate: '2025-09-04', contributions: 29, likes: 41, views: 495, responses: 9 },
  { title: 'Department Service Portal', category: 'Info Systems', createdDate: '2025-09-18', contributions: 17, likes: 25, views: 310, responses: 5 },
  { title: 'Campus Event Booking Platform', category: 'Info Systems', createdDate: '2025-10-07', contributions: 24, likes: 63, views: 760, responses: 14 },
  { title: 'Student Counseling Companion App', category: 'Mobile Apps', createdDate: '2025-10-29', contributions: 33, likes: 48, views: 540, responses: 12 },
  { title: 'Library Seat Reservation App', category: 'Mobile Apps', createdDate: '2025-11-11', contributions: 26, likes: 37, views: 455, responses: 8 },
  { title: 'Research Publication Insight Hub', category: 'Data Analytics', createdDate: '2025-11-25', contributions: 35, likes: 58, views: 685, responses: 15 },
  { title: 'Graduate Outcome Analytics Suite', category: 'Data Analytics', createdDate: '2025-12-09', contributions: 41, likes: 44, views: 590, responses: 10 },
  { title: 'Certificate Verification Console', category: 'Cybersecurity', createdDate: '2026-01-13', contributions: 19, likes: 28, views: 360, responses: 6 },
  { title: 'Student Access Control Monitor', category: 'Cybersecurity', createdDate: '2026-02-03', contributions: 22, likes: 31, views: 408, responses: 7 },
  { title: 'Assignment Feedback Recommendation Engine', category: 'AI & ML', createdDate: '2026-02-19', contributions: 47, likes: 67, views: 810, responses: 18 },
  { title: 'Alumni Operations Management Portal', category: 'Info Systems', createdDate: '2026-03-08', contributions: 28, likes: 35, views: 438, responses: 9 }
];

const requests = [
  { category: 'AI & ML', status: 'answered', requestedAt: '2025-08-21' },
  { category: 'Info Systems', status: 'completed', requestedAt: '2025-09-10' },
  { category: 'Mobile Apps', status: 'pending', requestedAt: '2025-09-28' },
  { category: 'Data Analytics', status: 'answered', requestedAt: '2025-10-19' },
  { category: 'AI & ML', status: 'completed', requestedAt: '2025-11-06' },
  { category: 'Cybersecurity', status: 'pending', requestedAt: '2025-11-26' },
  { category: 'Info Systems', status: 'answered', requestedAt: '2025-12-14' },
  { category: 'Mobile Apps', status: 'completed', requestedAt: '2026-01-08' },
  { category: 'Data Analytics', status: 'answered', requestedAt: '2026-02-11' },
  { category: 'AI & ML', status: 'pending', requestedAt: '2026-03-05' },
  { category: 'Cybersecurity', status: 'answered', requestedAt: '2026-03-18' },
  { category: 'AI & ML', status: 'in-review', requestedAt: '2026-03-26' }
];

const activity = [
  { month: '2025-07', value: 72 },
  { month: '2025-08', value: 94 },
  { month: '2025-09', value: 118 },
  { month: '2025-10', value: 137 },
  { month: '2025-11', value: 149 },
  { month: '2025-12', value: 171 },
  { month: '2026-01', value: 165 },
  { month: '2026-02', value: 188 },
  { month: '2026-03', value: 214 }
];

export { projects, requests, activity };
