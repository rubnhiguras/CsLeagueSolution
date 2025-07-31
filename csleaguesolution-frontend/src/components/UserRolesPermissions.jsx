import React from 'react';
import './UserRolesPermissions.css';

export const UserRolesPermissions = ({ user }) => {
    return (
        <div className="tree-container">
            {/* Encabezado del usuario */}
            <div className="user-header">
                <img src={user.avatarUrl} alt="Avatar" className="avatar" />
                <div className="user-info">
                    <h2>{user.name} {user.surname}</h2>
                    <p className="user-email">{user.email}</p>
                    <p className="user-meta">
                        <span className="user-phone">{user.phone}</span>
                        <span className={`status-badge ${user.disabled ? 'disabled' : 'active'}`}>
                            {user.disabled ? 'Deshabilitado' : 'Activo'}
                        </span>
                    </p>
                </div>
            </div>

            {/* Árbol de roles y permisos */}
            <div className="tree">
                <h3 className="tree-title">Estructura de Permisos</h3>
                
                {user.roles && user.roles.length > 0 ? (
                    <ul className="tree-root">
                        {user.roles.map(role => (
                            <li key={role.id} className="tree-node">
                                <div className="tree-node-header role-node">
                                    <div className="node-content">
                                        <p className="node-context tooltip">🌐 {role.context?.name}
                                            <span className="tooltiptext">{role.context?.description}</span> 
                                        </p>
                                         <p className="tooltip"><span className="node-icon"> 🎖️ </span><strong>{role.name}</strong>
                                                            <span className="node-description tooltiptext">{role.description}</span> 
                                        </p>
                                         
                                    </div>
                                </div>
                                
                                {role.permisos && role.permisos.length > 0 && (
                                    <ul className="tree-branch">
                                        {role.permisos.map(permiso => (
                                            <li key={permiso.id} className="tree-node">
                                                <div className="tree-node-header permission-node">
                                                    <div className="node-content">
                                                        <p className="node-context tooltip">🌐 {permiso.context?.name}
                                                            <span className="tooltiptext">{role.context?.description}</span> 
                                                        </p>
                                                        <p className="tooltip"><span className="node-icon"> 🔑 </span><strong>{permiso.name}</strong>
                                                            <span className="node-description tooltiptext">{permiso.description}</span> 
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="no-roles">
                        <i className="fas fa-exclamation-circle"></i>
                        El usuario no tiene roles asignados
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserRolesPermissions;