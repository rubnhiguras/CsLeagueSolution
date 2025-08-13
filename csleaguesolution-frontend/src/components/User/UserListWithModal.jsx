import { useState, useEffect, useRef } from 'react';
import { UserRolesPermissions } from './UserRolesPermissions'; 
import '../styles.css';
import axios from 'axios';

const UserListWithModal = () => {
  const AVATAR_DEFAULT = "https://e7.pngegg.com/pngimages/713/136/png-clipart-computer-icons-system-administrator-id-computer-network-heroes.png";
  const [users, setUsers] = useState([]);
  const [usersAvatares, setUsersAvatares] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); 
 


  const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost/api/api/users/showAllUsers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
        

        // Cargar avatares para cada usuario
         
        for (const user of data) {
          try {
            loadAvatar(user);
          } catch (err) {
            console.error(`Error loading avatar for user ${user.id}:`, err);
            usersAvatares[user.id] = AVATAR_DEFAULT;
          }
        }    
        setIsLoading(false);
      } catch (err) {
        setError(err.message || 'Error al cargar los usuarios');
        setIsLoading(false);
        console.error('Error fetching users:', err);
      }
    };

  useEffect(() => {
    fetchUsers();
  }, []);

  const loadAvatar = async (user) => {
    if (user?.avatarUrl) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(user.avatarUrl, {
            responseType: 'blob',
            headers: {
                Authorization: `Bearer ${token}`
            }
            });
            
            const blob = response.data;
            const reader = new FileReader();
            reader.onload = () => { 
                usersAvatares[user.id] = reader.result;
            };
            reader.readAsDataURL(blob);
        } catch (err) {
            console.error('Error loading avatar:', err);
            setError('Error al cargar el avatar'); 
        }
    } else {
        usersAvatares[user.id] = AVATAR_DEFAULT;
    }
  };

  // Filtrar usuarios según el término de búsqueda
  const filteredUsers = users.filter(user => 
    `${user.name} ${user.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.roles && user.roles.some(role => 
      role.name && role.name.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  // Formatear estado del usuario
  const getUserStatus = (disabled) => disabled ? 'Inactivo' : 'Activo';

  // Manejar clic en un usuario
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  if (isLoading) {
    return <div className="profile-container">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="profile-container error-message">{error}</div>;
  }

  return (
    <div className="profile-container">
      <h2>Lista de Usuarios</h2>
      
      {/* Barra de búsqueda */}
      <div className="input-group" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar usuarios por nombre, email o rol..."
          className="permission-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Tabla de usuarios */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--input-bg)' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Nombre</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Roles</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr 
                  key={user.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onClick={() => handleUserClick(user)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--input-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={usersAvatares[user.id]  || AVATAR_DEFAULT}
                        alt={`${user.name} ${user.surname}`}
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          objectFit: 'cover',
                          backgroundColor: '#2a2b33'
                        }}
                        onError={(e) => {
                          e.target.src = AVATAR_DEFAULT;
                        }}
                      />
                      <span>{user.name} {user.surname}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    {user.roles && user.roles.map(role => role.name).join(', ')}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: !user.disabled ? 'rgba(76, 175, 80, 0.2)' : 'rgba(239, 83, 80, 0.2)',
                      color: !user.disabled ? '#4CAF50' : '#EF5350'
                    }}>
                      {getUserStatus(user.disabled)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal de detalles del usuario */}
      {isModalOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
        <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            <button 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <UserRolesPermissions 
            user={selectedUser} 
            selectedUser={true}
            />  
        </div>
        </div>
      )}
    </div>
  );
};

export default UserListWithModal;