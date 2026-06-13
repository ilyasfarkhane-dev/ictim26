import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routerBasename } from "./config/paths";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/dashboard/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/dashboard/Login";
import DashboardHome from "./pages/dashboard/DashboardHome";
import SpeakersPage from "./pages/dashboard/SpeakersPage";
import TopicsPage from "./pages/dashboard/TopicsPage";
import DatesPage from "./pages/dashboard/DatesPage";
import WorkshopsPage from "./pages/dashboard/WorkshopsPage";
import SponsorsPage from "./pages/dashboard/SponsorsPage";
import CommitteesPage from "./pages/dashboard/CommitteesPage";
import FooterPage from "./pages/dashboard/FooterPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import ContentPage from "./pages/dashboard/ContentPage";
import MediaPage from "./pages/dashboard/MediaPage";
import HeroPage from "./pages/dashboard/HeroPage";
import EditionsPage from "./pages/dashboard/EditionsPage";
import QuickLinksPage from "./pages/dashboard/QuickLinksPage";

export default function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route path="/dashboard/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="hero" element={<HeroPage />} />
          <Route path="speakers" element={<SpeakersPage />} />
          <Route path="topics" element={<TopicsPage />} />
          <Route path="dates" element={<DatesPage />} />
          <Route path="quick-links" element={<QuickLinksPage />} />
          <Route path="workshops" element={<WorkshopsPage />} />
          <Route path="sponsors" element={<SponsorsPage />} />
          <Route path="committees" element={<CommitteesPage />} />
          <Route path="footer" element={<FooterPage />} />
          <Route path="editions" element={<EditionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="media" element={<MediaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
