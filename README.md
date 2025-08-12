# CSLeague Solution  

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)  
[![GitHub Issues](https://img.shields.io/github/issues/rubnhiguras/Rhascsleaguesolution)](https://github.com/rubnhiguras/Rhascsleaguesolution/issues)  
[![GitHub Stars](https://img.shields.io/github/stars/rubnhiguras/Rhascsleaguesolution)](https://github.com/rubnhiguras/Rhascsleaguesolution/stargazers)  

**CsLeagueSolution** es un sistema de gestión de usuarios diseñado para facilitar el registro, autenticación y administración de usuarios en aplicaciones web.  

## Características  

✅ **Registro y Autenticación de Usuarios**  
✅ **Gestión de Perfiles, Roles y Permisos**  
✅ **Recuperación de Contraseña**  
✅ **Interfaz Administrativa**  
✅ **API RESTful**  

## Tecnologías Utilizadas  

- **Backend**: Spring boot JAVA
- **Base de Datos**: SQL Postgresql 
- **Autenticación**: JWT (JSON Web Tokens)  
- **Frontend**: React.js PWA
- **Otros**: Bcrypt (hashing) 

## Instalación  

1. **Clonar el repositorio**:
   Descargar el fichero ZIP con el proyecto es otra opción. 
   ```sh
   git clone https://github.com/rubnhiguras/Rhascsleaguesolution.git
   cd Rhascsleaguesolution

3. **Instalar WSL o Linux con Docker**:

   Al instalar WSL o disponer de una máquina unix/linux, ejecutar los siguientes comandos  y sustituir la varibale USER por la del usuario del sistema.
   Si está realizando instalación a través de wsl, USER es el usuario de instalación.
   Para instalar WSL en Windows hay que ejecutar los siguientes comandos en git bash o en una CMD:

   ```
   wsl --install 
   (crear usuario y contraseña del entorno virtual de wsl/linux , por defecto en el comando anterior se instala Ubuntu)
<img width="622" height="188" alt="image" src="https://github.com/user-attachments/assets/b0b0a110-e0e4-4876-b2fc-5cf3a67f61e1" />

despues hay que ejecutar para iniciar sesión en el entorno virtual:

wsl 

   Una vez dentro, continuar con los siguientes comandos, donde USER es el usuario de la instalación anterior:

   ```
   sudo apt update && sudo apt upgrade -y
   sudo apt-get install -y ca-certificates curl gnupg lsb-release
   sudo mkdir -m 0755 -p /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt install -y docker.io 
   sudo usermod -aG docker $USER
   sudo systemctl enable docker
   sudo apt-get update
   sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin
   sudo systemctl restart docker
   ```
5. **Desplegar**:
    Para desplegar, ejecutar: 
       .\boot-dev.sh
      
   
