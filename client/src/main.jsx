import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Routes, Route, useLocation, Outlet } from 'react-router-dom'
import App from './App'
import AllListings from './AllListings'
import ListingDetail from './ListingDetail'
import Staging from './Staging'
import Testimonials from './Testimonials'
import OurTeam from './OurTeam'
import AdminDashboard from './admin/AdminDashboard'
import EditProperty from './admin/EditProperty'
import AdminLogin from './admin/AdminLogin'
import AdminsManager from './admin/AdminsManager'
import NotFound from './NotFound'
import { AuthProvider } from './admin/AuthProvider'
import PrivateRoute from './admin/PrivateRoute'
import './index.css'
import { initLenis, getLenis } from './lib/lenis'
import PageLoader from './components/PageLoader'

function PageWrapper({ children }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition min-h-screen">
      {children}
    </div>
  );
}

function RootLayout() {
  return (
    <GlobalLoaderProvider>
      <LenisProvider>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </LenisProvider>
    </GlobalLoaderProvider>
  );
}

function LenisProvider({ children }) {
  const location = useLocation()

  useEffect(() => {
    initLenis()
  }, [])

  useEffect(() => {
    const lenis = getLenis()
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(0, { immediate: false })
    } else {
      window.scrollTo(0, 0)
    }
  }, [location])

  return children
}

// Global loader component that watches all route changes
function GlobalLoaderProvider({ children }) {
  const location = useLocation();
  const [globalLoading, setGlobalLoading] = useState(true);
  const isInitialMount = React.useRef(true);

  // Initial page load
  useEffect(() => {
    const onLoad = () => {
      setTimeout(() => setGlobalLoading(false), 1000);
    };
    
    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  // Route changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Show loader on route change
    setGlobalLoading(true);
    const timer = setTimeout(() => setGlobalLoading(false), 1100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Link clicks
  useEffect(() => {
    const onDocClick = (e) => {
      try {
        const el = e.target?.closest?.('a');
        if (!el) return;
        const href = el.getAttribute('href');
        if (!href) return;
        if (href.startsWith('#')) return;
        if (el.target === '_blank' || el.hasAttribute('download')) return;
        if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;
        
        setGlobalLoading(true);
      } catch (err) {
        // noop
      }
    };

    document.addEventListener('click', onDocClick, true);
    return () => document.removeEventListener('click', onDocClick, true);
  }, []);

  // Browser back/forward
  useEffect(() => {
    const onPop = () => setGlobalLoading(true);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Custom events from Header
  useEffect(() => {
    const onStart = () => setGlobalLoading(true);
    window.addEventListener('startPageLoad', onStart);
    return () => window.removeEventListener('startPageLoad', onStart);
  }, []);

  return (
    <>
      <PageLoader open={globalLoading} />
      {children}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <PageWrapper><App /></PageWrapper> },
      { path: '/all-listings', element: <PageWrapper><AllListings /></PageWrapper> },
      { path: '/listing/:id', element: <PageWrapper><ListingDetail /></PageWrapper> },
      { path: '/staging', element: <PageWrapper><Staging /></PageWrapper> },
      { path: '/testimonials', element: <PageWrapper><Testimonials /></PageWrapper> },
      { path: '/our-team', element: <PageWrapper><OurTeam /></PageWrapper> },
      { path: '/admin/login', element: <AdminLogin /> },
      { path: '/admin/admins', element: <PrivateRoute><PageWrapper><AdminsManager /></PageWrapper></PrivateRoute> },
      { path: '/admin', element: <PrivateRoute><PageWrapper><AdminDashboard /></PageWrapper></PrivateRoute> },
      { path: '/admin/new', element: <PrivateRoute><PageWrapper><EditProperty /></PageWrapper></PrivateRoute> },
      { path: '/admin/edit/:id', element: <PrivateRoute><PageWrapper><EditProperty /></PageWrapper></PrivateRoute> },
      { path: '/admin/listings', element: <PrivateRoute><PageWrapper><AdminDashboard /></PageWrapper></PrivateRoute> },
      { path: '/admin/active', element: <PrivateRoute><PageWrapper><AdminDashboard /></PageWrapper></PrivateRoute> },
      { path: '/admin/sold', element: <PrivateRoute><PageWrapper><AdminDashboard /></PageWrapper></PrivateRoute> },
      { path: '*', element: <PageWrapper><NotFound /></PageWrapper> }
    ]
  }
])

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <RouterProvider router={router} future={{ v7_startTransition: true, v7_relativeSplatPath: true }} />
  </React.StrictMode>
)