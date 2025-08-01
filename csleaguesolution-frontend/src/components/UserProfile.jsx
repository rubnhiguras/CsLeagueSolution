// src/components/UserProfile.jsx
import React, { useEffect, useState } from 'react';
import './styles.css';
import { UserRolesPermissions } from './UserRolesPermissions'; 
import './UserRolesPermissions.css';
import axios from 'axios';
import { FiLogOut, FiHome, FiActivity, FiUser, FiUsers, FiCalendar, FiFileText, FiRefreshCw  } from "react-icons/fi";

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

  return (
    <div className="profile-container">
      <div className="sidebar flex flex-row items-center p-6 gap-6 justify-between w-full">
        {/* Botones a la izquierda */}
        <div className="flex flex-row gap-6">
          <button className="sidebar-button tooltip" onClick={() => setSectionSelected('Feed')}>
            <FiHome size={20} /> 
            <span className="tooltiptext">Feed</span>
          </button>
          <button className="sidebar-button tooltip" onClick={() => setSectionSelected('Perfil')}>
            <FiUser size={20} /> 
            <span className="tooltiptext">Perfil</span>
          </button>
          <button className="sidebar-button tooltip" onClick={() => setSectionSelected('Partidos')}>
            <FiCalendar size={20} /> 
            <span className="tooltiptext">Partidos</span>
          </button>
          <button className="sidebar-button tooltip" onClick={() => setSectionSelected('Equipo')}>
            <FiUsers size={20} /> 
            <span className="tooltiptext">Equipo</span>
          </button>
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
        {sectionSelected === 'Perfil' ? 
          (
            <UserRolesPermissions user={user} ></UserRolesPermissions>
          ) : 
          ( 
            <span>{sectionSelected}</span> 
          )
        }
      </div>

    </div>
  );
};