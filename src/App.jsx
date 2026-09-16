import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth Pages
import Landing from './pages/Landing';
import StudentLogin from './pages/StudentLogin';
import TeacherLogin from './pages/TeacherLogin';

// Layouts (will contain Sidebar and Navbar)
import TeacherLayout from './components/TeacherLayout';
import StudentLayout from './components/StudentLayout';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateExam from './pages/teacher/CreateExam';
import ManageExams from './pages/teacher/ManageExams';
import ViewResults from './pages/teacher/ViewResults';
import TeacherProfile from './pages/teacher/TeacherProfile';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableExams from './pages/student/AvailableExams';
import ExamPage from './pages/student/ExamPage';
import ResultPage from './pages/student/ResultPage';
import MyResults from './pages/student/MyResults';
import StudentProfile from './pages/student/StudentProfile';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="create-exam" element={<CreateExam />} />
          <Route path="manage-exams" element={<ManageExams />} />
          <Route path="results" element={<ViewResults />} />
          <Route path="profile" element={<TeacherProfile />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="available-exams" element={<AvailableExams />} />
          <Route path="my-results" element={<MyResults />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Standalone Student Routes (no sidebar for taking exam) */}
        <Route path="/student/exam/:examId" element={<ExamPage />} />
        <Route path="/student/result/:resultId" element={<ResultPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
