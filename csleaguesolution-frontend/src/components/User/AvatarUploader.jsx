import { useState, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';
import './avatarUploader.css';
import axios from 'axios';

const AvatarUploader = ({user}) => {
  const AVATAR_DEFAULT = "https://e7.pngegg.com/pngimages/713/136/png-clipart-computer-icons-system-administrator-id-computer-network-heroes.png";
  const [previewUrl, setPreviewUrl] = useState(AVATAR_DEFAULT); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  // Cargar el avatar inicial
  useEffect(() => {
    const loadAvatar = async () => {
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
            setPreviewUrl(reader.result);
          };
          reader.readAsDataURL(blob);
        } catch (err) {
          console.error('Error loading avatar:', err);
          setError('Error al cargar el avatar'); 
        }
      }else{
        setPreviewUrl(AVATAR_DEFAULT);
      }
    };

    loadAvatar();
  }, [user?.avatarUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validación del archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    // Mostrar previsualización
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target.result);
    };
    reader.readAsDataURL(file);

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      
       const response = await axios.post(
        `http://localhost/api/api/users/${user.id}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      user.avatarUrl=response.data.avatarUrl;
       
    } catch (error) {
      console.error('Error al actualizar el avatar:', error);
      setError('Error al actualizar el avatar');
      setPreviewUrl(user.avatarUrl); // Revertir a la imagen anterior
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    setShowModal(true);
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(user.avatarUrl, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const fileName = user.avatarUrl.split('/').pop();
      saveAs(response.data, 'avatar_user_'+ user.name + '_' + fileName +'.png');
    } catch (error) {
      console.error('Error downloading avatar:', error);
      setError('Error al descargar el avatar');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };


  return (
    <div className="avatar-container">
      {isLoading && <div className="loading-overlay">Subiendo...</div>}
      <img
        src={previewUrl}
        alt="Avatar"
        className={`avatar ${isLoading ? 'loading' : ''}`}
        onClick={handleAvatarClick}
        style={{ 
          width: '150px', 
          height: '150px', 
          borderRadius: '50%', 
          objectFit: 'cover',
          cursor: 'pointer'
        }}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      {error && <div className="error-message">{error}</div>}
       {/* Modal para opciones de imagen */}
      {showModal && (
        <div className="avatar-modal">
          <div className="modal-content">
            <span className="close-modal" onClick={() => setShowModal(false)}>&times;</span>
            <h3>Avatar de {user.name}</h3>
            
            <div className="modal-preview">
              <img 
                src={previewUrl} 
                alt="Vista previa ampliada" 
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            </div>
            
            <div className="modal-actions">
              <button onClick={triggerFileInput}>
                <i className="fas fa-upload"></i> Cambiar imagen
              </button>
              
              {user?.avatarUrl && (
                <button onClick={handleDownload}>
                  <i className="fas fa-download"></i> Descargar
                </button>
              )}
              
              <button onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i> Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUploader;