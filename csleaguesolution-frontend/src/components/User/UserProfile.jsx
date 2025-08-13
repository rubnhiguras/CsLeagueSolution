// src/components/UserProfile.jsx
import React, { useEffect, useState } from 'react';
import '../styles.css';
import { UserRolesPermissions } from './UserRolesPermissions'; 
import UserListWithModal from './UserListWithModal';
import './UserRolesPermissions.css';
import axios from 'axios';
import { FiLogOut, FiHome, FiUser, FiUsers, FiCalendar, FiRefreshCw } from "react-icons/fi";
import { FaTrophy, FaUsers, FaNewspaper, FaHandshake } from "react-icons/fa";

export const UserProfile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [sectionSelected, setSectionSelected] = useState('Feed');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost/api/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        setError('Failed to load user profile.');
        localStorage.removeItem('token');
        onRefresh();
      }
    };
    fetchUser();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // await fetchData(); // tu función para recargar datos
      window.location.reload(true);
    } finally {
      // Espera un poco para que se vea la animación
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading...</p>;

const hasFullAccess = user.roles?.some(role =>
    role.permisos?.some(permiso => permiso.name === "FULL_ACCESS")
);

const hasUserAccess = user.roles?.some(role =>
    role.permisos?.some(permiso =>
        permiso.name === "SHOW_USERS_ACCESS" ||
        permiso.name === "EDIT_USERS_ACCESS" ||
        permiso.name === "DISABLE_USERS_ACCESS"
    )
);

  return (
    <div className="profile-container">
      <div className="sidebar flex flex-row items-center p-6 gap-6 justify-between w-full">
        {/* Botones a la izquierda */}
        <div className="flex flex-row gap-6">
          <button className="sidebar-button tooltip" onClick={() => setSectionSelected('Feed')}>
            <FiHome size={20} /> 
            <span className="tooltiptext">Feed</span>
          </button>
          <button className="sidebar-button tooltip" onClick={() => setSectionSelected('Noticias')}>
            <FaNewspaper size={20} /> 
            <span className="tooltiptext">Noticias</span>
          </button>
          <button className="sidebar-button tooltip" onClick={() => setSectionSelected('Perfil')}>
            <FiUser size={20} /> 
            <span className="tooltiptext">Perfil</span>
          </button>
          <button className="sidebar-button tooltip" onClick={() => setSectionSelected('Partidos')}>
            <FiCalendar size={20} /> 
            <span className="tooltiptext">Partidos</span>
          </button>
          <button className="sidebar-button tooltip" onClick={() => setSectionSelected('Equipos')}>
            <FaUsers size={20} /> 
            <span className="tooltiptext">Equipos</span>
          </button>
          <button className="sidebar-button tooltip" onClick={() => setSectionSelected('Competiciones')}>
            <FaTrophy size={20} /> 
            <span className="tooltiptext">Competiciones</span>
          </button>
          <button className="sidebar-button tooltip" onClick={() => setSectionSelected('Patrocinadores')}>
            <FaHandshake size={20} /> 
            <span className="tooltiptext">Patrocinadores</span>
          </button>
          {(hasFullAccess || hasUserAccess) && (
          <button className="sidebar-button tooltip" onClick={() => setSectionSelected('Usuarios')}>
            <FiUsers size={20} /> 
            <span className="tooltiptext">Usuarios</span>
          </button>
          )}
          <span/>
          <button className="sidebar-button tooltip" onClick={onRefresh}>
            <FiRefreshCw 
              size={20} 
              className={refreshing ? "animate-spin" : ""} 
            />
            <span className="tooltiptext">Refrescar</span>
          </button>
          <button className="sidebar-button tooltip" onClick={onLogout}>
            <FiLogOut size={20} />
            <span className="tooltiptext">Logout</span>
          </button>
        </div> 
      </div>

      <div className="profile-info">
        {sectionSelected === 'Perfil' && (
          <UserRolesPermissions user={user} selectedUser={false}/>
        )}
        
        {sectionSelected === 'Usuarios' && (hasFullAccess || hasUserAccess) && (
          <UserListWithModal />
        )}
        
        {!['Perfil', 'Usuarios'].includes(sectionSelected) && (
          <span>{sectionSelected}</span> 
        )}
      </div>

    </div>
  );
};