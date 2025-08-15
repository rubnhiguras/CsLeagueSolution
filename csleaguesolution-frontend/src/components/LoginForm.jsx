// src/components/LoginForm.jsx
import React, { useState } from 'react';
import './styles.css';
import axios from 'axios';

export const LoginForm = ({ onLogin, handleRegisterWoToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/api/auth/login', { email, password });
      const token = response.data.token;
      localStorage.setItem('token', token);
      onLogin(token);
    } catch (err) { 
      setError('Fallo en la autenticación: ' + err.response.data.token);
    }
  };

  return (
     <div className="profile-container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <form onSubmit={handleLogin} className="login-form">
        <h2>Iniciar Sesión</h2>
        
        <div className="profile-info">
          <div className="input-group">
            <label>
              <strong>Email:</strong>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />
            </label>
          </div>
          
          <div className="input-group">
            <label>
              <strong>Contraseña:</strong>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
            </label>
          </div>
        </div>

        <button type="submit" className="logout-button" style={{ width: '100%' }}>
          Acceder
        </button>

        {error && <p className="error-message">{error}</p>}

        
      </form>
      <p className="text-center mt-4" style={{ color: '#61dafb' }}>
          ¿No tienes cuenta? <br/><button onClick={handleRegisterWoToken} className="logout-button" style={{backgroundColor: '#ffff99'}}>Registrarse</button>
        </p>
    </div>
  );
};