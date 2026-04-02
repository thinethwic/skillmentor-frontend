import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PaymentPage from "@/pages/PaymentPage";

import AdminLayout from "@/components/Adminlayout";
import CreateSubjectPage from "@/pages/admin/Createsubjectpage";
import MentorsPage from "@/pages/admin/Mentorspage";
import CreateMentorPage from "@/pages/admin/Creatementorpage";
import ManageBookingsPage from "@/pages/admin/Managebookingspage";
import SubjectsListPage from "./pages/admin/SubjectList";
import { MentorProfilePage } from "./components/MentorProfilePage";
import AdminOverviewPage from "./pages/admin/Adminoverviewpage";
import { ScrollToTop } from "./components/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public site layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Public mentor profile — no auth required */}
          <Route path="/mentors/:id/profile" element={<MentorProfilePage />} />

          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <DashboardPage />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/login" replace />
                </SignedOut>
              </>
            }
          />

          <Route
            path="/payment/:sessionId"
            element={
              <>
                <SignedIn>
                  <PaymentPage />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/login" replace />
                </SignedOut>
              </>
            }
          />
        </Route>

        {/* Admin layout only */}
        <Route
          path="/admin"
          element={
            <>
              <SignedIn>
                <AdminLayout />
              </SignedIn>
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            </>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverviewPage />} />
          <Route path="subjects" element={<SubjectsListPage />} />
          <Route path="subjects/create" element={<CreateSubjectPage />} />
          <Route path="mentors" element={<MentorsPage />} />
          <Route path="mentors/create" element={<CreateMentorPage />} />
          <Route path="bookings" element={<ManageBookingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
