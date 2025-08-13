import React, { useMemo, useState, useEffect } from 'react';
import AvatarUploader from './AvatarUploader';
import { FiChevronRight, FiChevronDown, FiSave, FiTrash2, FiPlus } from 'react-icons/fi';
import './UserRolesPermissions.css';
import '../styles.css';
import axios from 'axios';

export const UserRolesPermissions = ({ user }) => {
    const [expandedContexts, setExpandedContexts] = useState({});
    const [expandedRoles, setExpandedRoles] = useState({});
    const [treeData, setTreeData] = useState(user?.roles || []);
    const [saving, setSaving] = useState(false);
    const [allPermissions, setAllPermissions] = useState([]);
    const [allContexts, setAllContexts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [contextSearchTerm, setContextSearchTerm] = useState('');
    
    const [userHeader, setUserHeader] = useState({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        phone: user.phone || "",
        instagram: user.instagram,
        disabled: user.disabled || false
    });

    useEffect(() => {
        fetchContexts();
    }, []);

    const fetchContexts = async (query) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost/api/api/contexts?query=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllContexts(response.data);
        } catch (error) {
            console.error("Error buscando contextos", error);
        }
    };

    const fetchPermissions = async (query, context) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost/api/api/permissions?query=${query}&context=${context}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllPermissions(response.data); 
        } catch (error) {
            console.error("Error buscando permisos", error);
        }
    };

    const addExistingContext = (context) => {
        const contextExists = treeData.some(role => 
            role.context && role.context.id === context.id
        );
        
        if (!contextExists) {
            setTreeData([
                ...treeData,
                { 
                    id: null, 
                    name: null, 
                    description: null, 
                    context: context, 
                    permisos: [] 
                }
            ]);
        }
    };

    const addExistingPermissionToRole = (roleId, permiso) => {
        setTreeData(prevData => prevData.map(r => {
            if (r.id === roleId) {
                const exists = r.permisos?.some(p => p.id === permiso.id);
                if (!exists) {
                    return {
                        ...r,
                        permisos: [...(r.permisos || []), permiso]
                    };
                }
            }
            return r;
        }));
    };

    const groupedByContext = useMemo(() => {
        const contextMap = {};
        if (!treeData) return [];

        treeData.forEach(role => {
            const ctx = role.context || { id: 'sin-contexto', name: 'Sin contexto', description: '' };
            const contextId = ctx.id || `ctx-${ctx.name}`;

            if (!contextMap[contextId]) {
                contextMap[contextId] = {
                    context: ctx,
                    roles: []
                };
            }

            if (role.name) {
                contextMap[contextId].roles.push(role);
            }
        });

        return Object.values(contextMap);
    }, [treeData]);

    const toggleContext = (contextId) => {
        setExpandedContexts(prev => ({ ...prev, [contextId]: !prev[contextId] }));
    };

    const toggleRole = (roleId) => {
        setExpandedRoles(prev => ({ ...prev, [roleId]: !prev[roleId] }));
    };

    const closeAllRolesExceptOne = (roleId) => {
        // Cerrar todos los contextos primero
        const newExpandedContexts = {};
        groupedByContext.forEach(({ context, roles }) => {
            const contextId = context.id || context.name;
            // Solo mantener abierto el contexto que contiene el rol que queremos
            if (roles.some(role => role.id === roleId)) {
                newExpandedContexts[contextId] = true;
            } else {
                newExpandedContexts[contextId] = false;
            }
        });
        setExpandedContexts(newExpandedContexts);

        // Cerrar todos los roles excepto el especificado
        const newExpandedRoles = {};
        newExpandedRoles[roleId] = true; // Solo este rol permanecerá abierto
        setExpandedRoles(newExpandedRoles);
    };

    const addRole = (context) => {
        const name = prompt("Nombre del rol:");
        if (!name) return;
        const description = prompt("Descripción del rol:") || "";
        
        const newRole = { 
            id: null, 
            name, 
            description, 
            context, 
            permisos: [] 
        };
        setTreeData([...treeData, newRole]);
    };

    const removeContext = (context) => {
        const hasRoles = treeData.some(r => r.context?.id === context.id && r.name);
        if (hasRoles) {
            alert("No puedes eliminar un contexto que contiene roles.");
            return;
        }
        setTreeData(treeData.filter(r => r.context?.id !== context.id));
    };

    const removeRole = (roleId) => {
        setTreeData(treeData.filter(r => r.id !== roleId));
    };

    const removePermission = (roleId, permId) => {
        setTreeData(treeData.map(r => {
            if (r.id === roleId) {
                return {
                    ...r,
                    permisos: r.permisos.filter(p => p.id !== permId)
                };
            }
            return r;
        }));
    };

    const onSave = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            await axios.put("http://localhost/api/api/users/me", userHeader, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if(hasFullAccess || hasTreeRoleAccess) {
                const payload = {
                    userId: user.id,
                    contexts: groupedByContext.map(g => ({
                        id: g.context.id,
                        name: g.context.name,
                        description: g.context.description,
                        roles: g.roles.map(r => ({
                            id: r.id,
                            name: r.name,
                            description: r.description,
                            permissions: (r.permisos || []).map(p => ({
                                id: p.id,
                                name: p.name,
                                description: p.description
                            }))
                        }))
                    }))
                };

                await axios.post(`http://localhost/api/api/users/${user.id}/permissions`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            alert("Datos guardados correctamente ✅");
        } catch (error) {
            console.error("Error al guardar datos del usuario", error);
            alert("❌ Error al guardar la información del usuario");
        } finally {
            setSaving(false);
        }
    };

    const handleSave = () => {
        onSave(treeData);
    };

    const hasFullAccess = treeData.some(role =>
        role.permisos?.some(permiso => permiso.name === "FULL_ACCESS")
    );

    const hasTreeRoleAccess = treeData.some(role =>
        role.permisos?.some(permiso => permiso.name === "TREE_ROLES_ACCESS")
    );

    return (
        <div className="tree-container">
            <div className="tree-actions">
                <button className="sidebar-button tooltip" onClick={handleSave} disabled={saving}>
                    <FiSave size={20} /> 
                    <span className="tooltiptext">Guardar</span>
                </button>
            </div>

            <div className="user-header">
                <AvatarUploader user={user} />
                <div className="user-info">
                    <p className="user-email">{userHeader.email}</p>
                    <input
                        type="text"
                        className="user-header-input"
                        value={userHeader.name}
                        onChange={(e) => setUserHeader({ ...userHeader, name: e.target.value })}
                        placeholder="Nombre"
                    />

                    <input
                        type="text"
                        className="user-header-input"
                        value={userHeader.surname}
                        onChange={(e) => setUserHeader({ ...userHeader, surname: e.target.value })}
                        placeholder="Apellidos"
                    />

                    <input
                        type="text"
                        className="user-header-input"
                        value={userHeader.phone}
                        onChange={(e) => setUserHeader({ ...userHeader, phone: e.target.value })}
                        placeholder="Teléfono"
                    />
                    <div>
                        <label className="user-header-label">
                            <span className={`status-badge ${user.disabled ? 'disabled' : 'active'}`}>
                                {user.disabled ? 'Deshabilitado' : 'Activo'}
                            </span> 
                        </label>
                    </div>

                    <p className="user-description"> 
                        {groupedByContext.map(({ context, roles }) => {
                            if (roles.length === 0) return null;

                            const permisos = roles.flatMap(role => role.permisos || []).map(p => p.description);
                            const permisosUnicos = [...new Set(permisos)];
                            const roleNames = roles.map(role => role.description);

                            return (
                                `En el contexto "${context.description}", ${user.name} ${user.surname} tiene ` +
                                (roleNames.length === 1 ? `el rol "${roleNames[0]}"` : `los roles ${roleNames.map(r => `"${r}"`).join(', ')}`) +
                                (permisosUnicos.length > 0
                                    ? ` con los siguientes permisos: ${permisosUnicos.map(p => `"${p}"`).join(', ')}. `
                                    : ` sin permisos asignados. `)
                            );
                        }).filter(Boolean).join(' ')}
                    </p>
                </div>
            </div>

            {(hasFullAccess || hasTreeRoleAccess) && (
                <div className="tree">
                    <h3 className="tree-title">Roles y permisos por contexto</h3>

                    {groupedByContext.length > 0 ? (
                        <ul className="tree-root">
                            {groupedByContext.map(({ context, roles }) => {
                                const contextId = context.id || context.name;
                                const isContextOpen = expandedContexts[contextId] ?? true;

                                return (
                                    <li key={contextId} className="tree-node">
                                        <div 
                                            className="tree-node-header context-node tooltip"
                                            onClick={() => toggleContext(contextId)}
                                        >
                                            {isContextOpen ? <FiChevronDown /> : <FiChevronRight />}
                                            🌐 {context.name}
                                            <span className="tooltiptext">{context.description}</span>
                                            <div className="actions-inline">
                                                <button 
                                                    className="delete-button small" 
                                                    onClick={(e) => { e.stopPropagation(); removeContext(context); }}
                                                >
                                                    <FiTrash2 size={12}/>
                                                </button>
                                            </div>
                                        </div>

                                        {isContextOpen && (
                                            <>
                                                <ul className="tree-branch">
                                                    {roles.length === 0 && (
                                                        <li className="tree-node empty-node"><i>Sin roles</i></li>
                                                    )}
                                                    {roles.map(role => {
                                                        const isRoleOpen = expandedRoles[role.id] ?? true;
                                                        return (
                                                            <li key={role.id} className="tree-node" data-role-id={role.id}>
                                                                <div 
                                                                    className="tree-node-header role-node tooltip"
                                                                    onClick={() => toggleRole(role.id)}
                                                                >
                                                                    {isRoleOpen ? <FiChevronDown /> : <FiChevronRight />}
                                                                    🎖️ <strong>{role.name}</strong>
                                                                    <span className="tooltiptext">{role.description}</span>
                                                                    <div className="actions-inline">
                                                                        <button 
                                                                            className="delete-button small" 
                                                                            onClick={(e) => { e.stopPropagation(); removeRole(role.id); }}
                                                                        >
                                                                            <FiTrash2 size={12}/>
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {isRoleOpen && (
                                                                    <>
                                                                        <ul className="tree-branch">
                                                                            {(!role.permisos || role.permisos.length === 0) && (
                                                                                <li className="tree-node empty-node"><i>Sin permisos</i></li>
                                                                            )}
                                                                            {role.permisos?.map(permiso => (
                                                                                <li key={permiso.id} className="tree-node">
                                                                                    <div className="tree-node-header permission-node tooltip">
                                                                                        🔑 {permiso.name}
                                                                                        <span className="tooltiptext">{permiso.description}</span>
                                                                                        <button 
                                                                                            className="delete-button small" 
                                                                                            onClick={(e) => { e.stopPropagation(); removePermission(role.id, permiso.id); }}
                                                                                        >
                                                                                            <FiTrash2 size={12}/>
                                                                                        </button>
                                                                                    </div>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                        <div className="tree-add-bar">
                                                                            <FiPlus size={12} /> Añadir permiso
                                                                            <input 
                                                                                type="text" 
                                                                                className="permission-search-input" 
                                                                                placeholder="Buscar permisos..."
                                                                                value={searchTerm}
                                                                                onChange={(e) => {
                                                                                    const query = e.target.value;
                                                                                    setSearchTerm(query);
                                                                                    if (query.length > 1) {
                                                                                        fetchPermissions(query, context.name);
                                                                                        // Cierra todos los roles excepto el actual cuando se empieza a buscar
                                                                                        if (role.id) {
                                                                                            closeAllRolesExceptOne(role.id);
                                                                                        }
                                                                                    } else {
                                                                                        setAllPermissions([]);
                                                                                    }
                                                                                }}
                                                                                 onFocus={() => {
                                                                                    // Cierra todos los roles excepto el actual cuando se hace focus
                                                                                    if (role.id) {
                                                                                        closeAllRolesExceptOne(role.id);
                                                                                    }
                                                                                }}
                                                                            />

                                                                            {allPermissions.length > 0 && (
                                                                                <ul className="search-permission-list">
                                                                                    {allPermissions.map(p => (
                                                                                        <li key={p.id} onClick={() => addExistingPermissionToRole(role.id, p)}>
                                                                                            🔍 {p.name}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                                <div className="tree-add-bar" onClick={() => addRole(context)}>
                                                    <FiPlus size={12} /> Crear y añadir rol
                                                </div>
                                            </>
                                        )} 
                                    </li>
                                );
                            })}
                            <div className="tree-add-bar">
                                <FiPlus size={12} /> Añadir contexto
                                <input 
                                    type="text" 
                                    className="context-search-input" 
                                    placeholder="Buscar contextos..."
                                    value={contextSearchTerm}
                                    onChange={(e) => {
                                        const query = e.target.value;
                                        setContextSearchTerm(query);
                                        if (query.length > 1) {
                                            fetchContexts(query);
                                        } else {
                                            setAllContexts([]);
                                        }
                                    }}
                                />

                                {allContexts.length > 0 && (
                                    <ul className="search-context-list">
                                        {allContexts.map(c => (
                                            <li key={c.id} onClick={() => addExistingContext(c)}>
                                                🌐 {c.name} - {c.description}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </ul>
                    ) : (
                        <div className="no-roles">
                            <i className="fas fa-exclamation-circle"></i>
                            El usuario no tiene roles ni contextos
                            <div className="tree-add-bar">
                                <FiPlus size={12} /> Añadir contexto
                                <input 
                                    type="text" 
                                    className="context-search-input" 
                                    placeholder="Buscar contextos..."
                                    value={contextSearchTerm}
                                    onChange={(e) => {
                                        const query = e.target.value;
                                        setContextSearchTerm(query);
                                        if (query.length > 1) {
                                            fetchContexts(query);
                                        } else {
                                            setAllContexts([]);
                                        }
                                    }}
                                />
                                {allContexts.length > 0 && (
                                    <ul className="search-context-list">
                                        {allContexts.map(c => (
                                            <li key={c.id} onClick={() => addExistingContext(c)}>
                                                🌐 {c.name} - {c.description}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserRolesPermissions;