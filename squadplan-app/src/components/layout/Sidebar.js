import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

const Sidebar = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const profileData = {
    imagenPerfil: currentUser?.photoURL, // Suponiendo que tienes una URL de imagen en el usuario
    email: currentUser?.email // O cualquier otro dato que necesites
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/profile', icon: '👤', label: 'Mi Perfil' },
    { path: '/groups', icon: '👥', label: 'Mis Grupos' },
    { path: '/create-group', icon: '➕', label: 'Crear Grupo' },
    { path: '/users', icon: '👥', label: 'Mis Amigos' },
  ];

  return (
    <div className="sidebar bg-white shadow-sm d-flex flex-column" style={{ width: '280px', minHeight: '100vh' }}>
      <div className="p-3 border-bottom">
        <h4 className="mb-0">SquadPlan</h4>
      </div>

      <div className="p-3">
        <div className="d-flex align-items-center mb-4">
          <div className="avatar bg-primary rounded-circle me-2" style={{ width: '40px', height: '40px' }}>
            {profileData.imagenPerfil && (
              <img src={profileData.imagenPerfil} alt="Imagen de perfil" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            )}
          </div>
          <div>
            <small className="text-muted d-block">Bienvenido</small>
            <strong>{currentUser?.email}</strong>
          </div>
        </div>

        <nav className="nav flex-column">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link mb-2 ${location.pathname === item.path ? 'active bg-light' : ''
                }`}
            >
              <span className="me-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-3 border-top">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100"
        >
          <span className="me-2">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};
export default Sidebar;