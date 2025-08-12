import React, { useMemo, useState } from 'react';
import AvatarUploader from './AvatarUploader';
import { FiChevronRight, FiChevronDown, FiSave, FiTrash2, FiPlus } from 'react-icons/fi';
import './UserRolesPermissions.css';
import './styles.css';
import axios from 'axios';

export const UserRolesPermissions = ({ user }) => {
    const [expandedContexts, setExpandedContexts] = useState({});
    const [expandedRoles, setExpandedRoles] = useState({});
    const [treeData, setTreeData] = useState(user?.roles || []);
    const [saving, setSaving] = useState(false);
    const [allPermissions, setAllPermissions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newPermission, setNewPermission] = useState({ name: '', description: '', contextId: '' });

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

    const addContext = () => {
        const name = prompt("Nombre del nuevo contexto:");
        if (!name) return;
        const description = prompt("Descripción del contexto:") || "";

        const newContext = { id: null, name, description };

        setTreeData([
            ...treeData,
            { id: null, name: null, description: null, context: newContext, permisos: [] }
        ]);
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

    const addPermission = (role) => {
        const name = prompt("Nombre del permiso:");
        if (!name) return;
        const description = prompt("Descripción del permiso:") || "";
        
        const updatedRoles = treeData.map(r => {
            if (r.id === role.id) {
                return { 
                    ...r, 
                    permisos: [...(r.permisos || []), { 
                        id: null, 
                        name, 
                        description, 
                        context: role.context 
                    }]
                };
            }
            return r;
        });
        setTreeData(updatedRoles);
    };

    const removeContext = (context) => {
        const hasRoles = treeData.some(r => r.context?.name === context.name && r.name);
        if (hasRoles) {
            alert("No puedes eliminar un contexto que contiene roles.");
            return;
        }
        setTreeData(treeData.filter(r => r.context?.name !== context.name));
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

    const createPermission = async () => {
        if (!newPermission.name || !newPermission.contextId) {
            alert("Nombre y contexto son obligatorios.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost/api/api/permissions', {
                name: newPermission.name,
                description: newPermission.description,
                contextId: newPermission.contextId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const created = response.data;
            setAllPermissions(prev => [...prev, created]);
            setNewPermission({ name: '', description: '', contextId: '' });
            alert("Permiso creado correctamente ✅");

        } catch (error) {
            console.error("Error creando permiso", error);
            alert("❌ Error al crear el permiso");
        }
    };


    const fetchPermissions = async (query) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost/api/api/permissions?query=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllPermissions(response.data); 
        } catch (error) {
            console.error("Error buscando permisos", error);
        }
    };

    const onSave = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');
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
            alert("Permisos guardados correctamente ✅");
        } catch (error) {
            console.error("Error al guardar permisos", error);
            alert("❌ Error al guardar los permisos");
        } finally {
            setSaving(false);
        }
    };

    const handleSave = () => {
        onSave(treeData);
    };

    return (
        <div className="tree-container">

            {/* Botones globales */}
            <div className="tree-actions">
                <button className="sidebar-button tooltip" onClick={handleSave} disabled={saving}>
                    <FiSave size={20} /> 
                    <span className="tooltiptext">Guardar</span>
                </button>
            </div>

            {/* Encabezado del usuario */}
            <div className="user-header">
                <AvatarUploader user={user} />
                <div className="user-info">
                    <h2>{user.name} {user.surname}</h2>
                    <p className="user-email">{user.email}</p>
                    <p className="user-meta">
                        <span className="user-phone">{user.phone}</span>
                        <span className={`status-badge ${user.disabled ? 'disabled' : 'active'}`}>
                            {user.disabled ? 'Deshabilitado' : 'Activo'}
                        </span>
                    </p>
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

            {/* Nuevos permisos*/}
            <div className="permission-creator">
                <h3>Permisos de usuario</h3>
                <div className="permission-form">
                    <input 
                        type="text" 
                        placeholder="Nombre del permiso"
                        value={newPermission.name}
                        onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                    />
                    <input 
                        type="text" 
                        placeholder="Descripción"
                        value={newPermission.description}
                        onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                    />
                    <select 
                        value={newPermission.contextId}
                        onChange={(e) => setNewPermission({ ...newPermission, contextId: e.target.value })}
                    >
                        <option value="">Seleccionar contexto</option>
                        {groupedByContext.map(({ context }) => (
                            <option key={context.id} value={context.id}>
                                {context.name}
                            </option>
                        ))}
                    </select>
                    <button onClick={createPermission}>
                        <FiPlus size={20} /> Crear Permiso
                    </button>
                </div>
            </div>


            {/* Árbol */}
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
                                                        <li key={role.id} className="tree-node">
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
                                                                    {/* 🔹 Añadir barra para permisos */}
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
                                                                                        fetchPermissions(query);
                                                                                    } else {
                                                                                        setAllPermissions([]);
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
                                            {/* 🔹 Añadir barra para roles */}
                                            <div className="tree-add-bar" onClick={() => addRole(context)}>
                                                <FiPlus size={12} /> Crear y añadir rol
                                            </div>
                                        </>
                                    )} 
                                </li>
                            );
                        })}
                         {/* 🔹 Añadir barra para contextos */}
                        <div className="tree-add-bar" onClick={addContext}>
                            <FiPlus size={12} /> Crear y añadir contexto
                        </div>
                    </ul>
                ) : (
                    <div className="no-roles">
                        <i className="fas fa-exclamation-circle"></i>
                        El usuario no tiene roles ni contextos
                        <div className="tree-add-bar" onClick={addContext}>
                            <FiPlus size={12} /> Añadir contexto
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserRolesPermissions;
