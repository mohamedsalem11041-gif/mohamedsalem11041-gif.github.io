import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import CursorTrail from "./components/CursorTrail";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Eagerly load Home for fast LCP (it's the landing page)
import Home from "./pages/Home";

// Lazy load all other pages to reduce initial bundle
const Projects = lazy(() => import("./pages/Projects"));
const CreativeStudio = lazy(() => import("./pages/CreativeStudio"));
const SkillsExperience = lazy(() => import("./pages/SkillsExperience"));
const FunZone = lazy(() => import("./pages/FunZone"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PortalHub = lazy(() => import("./pages/PortalHub"));
const Login = lazy(() => import("./pages/Login"));
const ECard = lazy(() => import("./pages/ECard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load admin components (rarely accessed)
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ProjectsManager = lazy(() => import("./pages/admin/ProjectsManager"));
const GraphicsManager = lazy(() => import("./pages/admin/GraphicsManager"));
const ReelsManager = lazy(() => import("./pages/admin/ReelsManager"));
const BlogManager = lazy(() => import("./pages/admin/BlogManager"));
const HobbiesManager = lazy(() => import("./pages/admin/HobbiesManager"));
const CertsManager = lazy(() => import("./pages/admin/CertsManager"));
const BadgesManager = lazy(() => import("./pages/admin/BadgesManager"));
const SettingsManager = lazy(() => import("./pages/admin/SettingsManager"));
const MessagesManager = lazy(() => import("./pages/admin/MessagesManager"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isECardRoute = location.pathname === "/e-card";

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const xOffset = Math.max(-120, Math.min(120, y * 0.04));
        const yOffset = Math.max(-160, Math.min(160, y * 0.06));
        document.documentElement.style.setProperty("--bg-x", `${xOffset}px`);
        document.documentElement.style.setProperty("--bg-y", `${yOffset}px`);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Admin routes have their own layout
  if (isAdminRoute) {
    return (
      <div className="min-h-screen text-slate-100">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<ProjectsManager />} />
              <Route path="graphics" element={<GraphicsManager />} />
              <Route path="reels" element={<ReelsManager />} />
              <Route path="blog" element={<BlogManager />} />
              <Route path="hobbies" element={<HobbiesManager />} />
              <Route path="certs" element={<CertsManager />} />
              <Route path="badges" element={<BadgesManager />} />
              <Route path="settings" element={<SettingsManager />} />
              <Route path="messages" element={<MessagesManager />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    );
  }

  // Public routes
  return (
    <div className="min-h-screen text-slate-100">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-sky-500 blur-3xl spotlight-slow-a" />
          <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-sky-600 blur-3xl spotlight-slow-b" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
          {!isECardRoute && <Navbar />}
          <PageTransition>
            <main className="pt-6">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Home is eagerly loaded for fast LCP */}
                  <Route path="/" element={<Home />} />
                  {/* All other routes are lazy loaded */}
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/studio" element={<CreativeStudio />} />
                  <Route path="/skills" element={<SkillsExperience />} />
                  <Route path="/blog" element={<FunZone />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/contact" element={<PortalHub />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/e-card" element={<ECard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
          </PageTransition>
        </div>

        {!isECardRoute && <Footer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CursorTrail />
      <AppContent />
      <SpeedInsights />
      <Analytics />
    </AuthProvider>
  );
}

export default App;
