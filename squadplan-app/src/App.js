import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './contexts/AuthContext'

import LandingPage from './components/auth/LandingPage';

import Dashboard from './components/dashboard/Dashboard.js';
import Profile from './components/profile/Profile';
import CreateGroup from './components/groups/CreateGroup';
import GroupDetail from './components/groups/GroupDetail';
import Layout from './components/layout/Layout';
import UserList from './components/auth/UserList';

import 'bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Componente para rutas protegidas
const PrivateRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const auth = currentUser || JSON.parse(localStorage.getItem('user'));

  if (!auth) {
    return <Navigate to="/login" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const auth = JSON.parse(localStorage.getItem('user'));
  return !auth ? children : <Navigate to="/dashboard" />;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública para la página de inicio */}
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />

          {/* Rutas protegidas existentes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/profile" element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/groups" element={
            <PrivateRoute>
              <Layout>
                <GroupDetail />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/create-group" element={
            <PrivateRoute>
              <Layout>
                <CreateGroup />
              </Layout>
            </PrivateRoute>
          } />


            <Route path="/users" element={
                          <PrivateRoute>
                          <Layout>
                            <UserList />
                          </Layout>
                        </PrivateRoute>
            } />


          <Route path="/groups/:groupId" element={
            <PrivateRoute>
              <Layout>
                <GroupDetail />
              </Layout>
            </PrivateRoute>
          } />

          {/* ... otras rutas ... */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
