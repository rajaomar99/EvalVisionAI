import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/teacher/DashboardPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ExamsPage from "./pages/teacher/ExamsPage";
import CreateExamPage from "./pages/teacher/CreateExamPage";
import ExamDetailPage from "./pages/teacher/ExamDetailPage";
import UploadSubmissionPage from "./pages/teacher/UploadSubmissionPage";
import AssignmentSubmissionsPage from "./pages/teacher/AssignmentSubmissionsPage";
import GuestRoute from "./components/GuestRoute";

function App() {
  return (
    <Routes>
      {/* Public auth pages (no layout chrome) */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* App shell */}
      <Route element={<AppLayout />}>
        {/* Public landing */}
        <Route path="/" element={<HomePage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Exam management */}
        <Route
          path="/exams"
          element={
            <ProtectedRoute>
              <ExamsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams/new"
          element={
            <ProtectedRoute>
              <CreateExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams/:examId"
          element={
            <ProtectedRoute>
              <ExamDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams/:examId/edit"
          element={
            <ProtectedRoute>
              <CreateExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams/:examId/upload"
          element={
            <ProtectedRoute>
              <UploadSubmissionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams/:examId/submissions"
          element={
            <ProtectedRoute>
              <AssignmentSubmissionsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all -> dashboard or home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
