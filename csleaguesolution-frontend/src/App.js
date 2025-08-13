import React, { useState, useEffect } from 'react'; 
import logo from './logo_p.svg';
import './App.css';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { UserProfile } from './components/User/UserProfile';  
import ScrollToTopButton from './components/ScrollToTopButton';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('login');
  const [welcome, setWelcome] = useState(true);

  const handleWelcomeAccess = () => {
    setWelcome(!welcome);
  }

  const handleLogin = (newToken) => {
    setToken(newToken);
    setView('profile');
  };

  const handleLoginWoToken = () => { 
    setView('login');
  };

  const handleRegisterWoToken = () => { 
    setView('register');
  };

  const handleRegister = (newToken) => {
    setToken(newToken);
    setView('profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setView('login');
  };

  useEffect(() => {
    if (token) {
      setView('profile');
    }
  }, [token]);

  if (!token) {
    return (
      <div className="App">
        {welcome ? (<div className="App-background">
          <h3>¡Bienvenidx a App User csleaguesolution!</h3>
          <img src={logo} className="App-logo" alt="logo" />
          <h3><button className="logout-button" onClick={handleWelcomeAccess}>Comenzar</button></h3>
        </div>) : ( <div className="App-background">
          {view === 'login' ? (
            <>
              <LoginForm onLogin={handleLogin} handleRegisterWoToken={handleRegisterWoToken} />
            </>
          ) : (
            <>
              <RegisterForm onRegister={handleRegister} handleLoginWoToken={handleLoginWoToken} /> 
            </>
          )}
        </div>)}
      </div>
    );
  }

  return (
    <div className="p-4">
      <UserProfile onLogout={handleLogout} />
      <div>
        <ScrollToTopButton></ScrollToTopButton>
      </div>
    </div>
  );
};

export default App;