import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import PageSkeleton from './components/PageSkeleton.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const Inicio = lazy(() => import('./pages/Inicio.jsx'));
const Servicios = lazy(() => import('./pages/Servicios.jsx'));
const Metodologia = lazy(() => import('./pages/Metodologia.jsx'));
const Nosotros = lazy(() => import('./pages/Nosotros.jsx'));
const Contacto = lazy(() => import('./pages/Contacto.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Registro = lazy(() => import('./pages/Registro.jsx'));
const Cuenta = lazy(() => import('./pages/Cuenta.jsx'));
const Equipo = lazy(() => import('./pages/Equipo.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Inicio />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/metodologia" element={<Metodologia />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route
                path="/cuenta"
                element={
                  <ProtectedRoute>
                    <Cuenta />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/equipo"
                element={
                  <ProtectedRoute requireStaff>
                    <Equipo />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AuthProvider>
  );
}

