import React, { useMemo, useState } from 'react';
import { FiChevronRight, FiChevronDown } from 'react-icons/fi';
import './UserRolesPermissions.css';

export const UserRolesPermissions = ({ user }) => {
    const [expandedContexts, setExpandedContexts] = useState({});
    const [expandedRoles, setExpandedRoles] = useState({});

    // Agrupar roles por contexto
    const groupedByContext = useMemo(() => {
        const contextMap = {};
        if (!user?.roles) return [];

        user.roles.forEach(role => {
            const contextId = role.context?.id || 'sin-contexto';
            if (!contextMap[contextId]) {
                contextMap[contextId] = {
                    context: role.context || { name: 'Sin contexto', description: '' },
                    roles: []
                };
            }
            contextMap[contextId].roles.push(role);
        });

        return Object.values(contextMap);
    }, [user]);

    // Alternar visibilidad de un contexto
    const toggleContext = (contextId) => {
        setExpandedContexts(prev => ({
            ...prev,
            [contextId]: !prev[contextId]
        }));
    };

    // Alternar visibilidad de un rol
    const toggleRole = (roleId) => {
        setExpandedRoles(prev => ({
            ...prev,
            [roleId]: !prev[roleId]
        }));
    };

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

            {/* Árbol de roles y permisos por contexto */}
            <div className="tree">
                <h3 className="tree-title">Estructura de Permisos por Contexto</h3>

                {groupedByContext.length > 0 ? (
                    <ul className="tree-root">
                        {groupedByContext.map(({ context, roles }) => {
                            const contextId = context.id || context.name;
                            const isContextOpen = expandedContexts[contextId] ?? true;

                            return (
                                <li key={contextId} className="tree-node">
                                    {/* Nodo de contexto */}
                                    <div 
                                        className="tree-node-header context-node tooltip"
                                        onClick={() => toggleContext(contextId)}
                                    >
                                        {isContextOpen ? <FiChevronDown /> : <FiChevronRight />}
                                        🌐 {context.name}
                                        <span className="tooltiptext">{context.description}</span>
                                    </div>

                                    {/* Roles dentro del contexto */}
                                    {isContextOpen && (
                                        <ul className="tree-branch">
                                            {roles.map(role => {
                                                const isRoleOpen = expandedRoles[role.id] ?? true;
                                                return (
                                                    <li key={role.id} className="tree-node">
                                                        <div 
                                                            className="tree-node-header role-node tooltip"
                                                            onClick={() => toggleRole(role.id)}
                                                        >
                                                            {isRoleOpen ? <FiChevronDown /> : <FiChevronRight />}
                                                            <span className="node-icon"> 🎖️ </span>
                                                            <strong>{role.name}</strong>
                                                            <span className="tooltiptext">{role.description}</span>
                                                        </div>

                                                        {/* Permisos del rol */}
                                                        {isRoleOpen && role.permisos?.length > 0 && (
                                                            <ul className="tree-branch">
                                                                {role.permisos.map(permiso => (
                                                                    <li key={permiso.id} className="tree-node">
                                                                        <div className="tree-node-header permission-node tooltip">
                                                                            <span className="node-icon"> 🔑 </span>
                                                                            {permiso.name}
                                                                            <span className="tooltiptext">{permiso.description}</span>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
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
