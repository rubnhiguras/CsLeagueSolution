// src/components/RegisterForm.jsx
import React, { useState } from 'react';
import './styles.css';
import axios from 'axios';

export const RegisterForm = ({ onRegister, handleLoginWoToken }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/api/auth/register', { name, surname, phone, email, password });
      const token = response.data.token;
      localStorage.setItem('token', token);
      onRegister(token);
    } catch (err) { 
      setError('Fallo en el registro: ' + err.response.data.token);
    }
  };

  return (
    <div className="bg-[#282c34] min-h-screen flex flex-col items-center justify-center p-4">
      <form onSubmit={handleRegister} className="profile-container" style={{ maxWidth: '450px' }}>
        <h2>Registro de Usuario</h2>
        
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

          <div className="input-group">
            <label>
              <strong>Repetir Contraseña:</strong>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="login-input"
              />
            </label>
          </div>

          <div className="input-group">
            <label>
              <strong>Nombre:</strong>
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="login-input"
              />
            </label>
          </div>

          <div className="input-group">
            <label>
              <strong>Apellidos:</strong>
              <input
                type="text"
                placeholder="Tus apellidos"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="login-input"
              />
            </label>
          </div>

          <div className="input-group">
            <label>
              <strong>Teléfono:</strong>
              <input
                type="tel"
                placeholder="+34 123 456 789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="login-input"
              />
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          className="logout-button"
          style={{ 
            width: '100%',
              /* Verde similar al que tenías */
            marginTop: '10px'
          }}
        >
          Registrarse
        </button>

        {error && <p className="error-message">{error}</p>}

        
      </form>
      <p className="text-center mt-4" style={{ color: '#61dafb' }}>
          ¿Ya tienes cuenta? <br/><button onClick={handleLoginWoToken} className="logout-button" style={{backgroundColor: '#ffff99'}}>Inicia sesión</button>
        </p>
    </div>
  );
};