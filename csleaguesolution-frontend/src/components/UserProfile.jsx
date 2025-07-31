// src/components/UserProfile.jsx
import React, { useEffect, useState } from 'react';
import './styles.css';
import { UserRolesPermissions } from './UserRolesPermissions'; 
import axios from 'axios';

export const UserProfile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

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

  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <button className="logout-button" onClick={onLogout}>Logout</button>
      <div className="profile-info">
        <UserRolesPermissions user={user} ></UserRolesPermissions>
      </div>
    </div>
  );
};