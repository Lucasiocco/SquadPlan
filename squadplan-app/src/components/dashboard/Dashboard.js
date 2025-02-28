import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [grupos, setGrupos] = useState([]);
    const [actividadesPendientes, setActividadesPendientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const gruposQuery = query(
                    collection(db, 'grupos'),
                    where('miembros', 'array-contains', currentUser.uid)
                );

                const gruposSnapshot = await getDocs(gruposQuery);
                const gruposData = gruposSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setGrupos(gruposData);

                const actividadesData = [];
                for (const grupo of gruposData) {
                    if (grupo.actividades) {
                        const actividadesGrupo = grupo.actividades
                            .filter(act => !act.completada)
                            .map(act => ({
                                ...act,
                                grupoNombre: grupo.nombre,
                                grupoId: grupo.id
                            }));
                        actividadesData.push(...actividadesGrupo);
                    }
                }
                setActividadesPendientes(actividadesData);

            } catch (error) {
                console.error('Error al cargar datos del dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <h1 className="mb-4">Dashboard</h1>

            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Mis Grupos</h5>
                            <h2 className="card-text">{grupos.length}</h2>

                                {grupos.map(grupo => (
                                    <div key={grupo.id}>
                                        <Link to={`/groups/${grupo.id}`} className="btn btn-primary">
                                            Ver Detalles
                                        </Link>
                                    </div>
                                ))}

                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Actividades Pendientes</h5>
                            <h2 className="card-text">{actividadesPendientes.length}</h2>
                            <button className="btn btn-primary">Ver Actividades</button>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Acciones Rápidas</h5>
                            <div className="d-grid gap-2">
                                <Link to="/create-group" className="btn btn-outline-primary">
                                    Crear Nuevo Grupo
                                </Link>
                                <button className="btn btn-outline-primary">
                                    Nueva Actividad
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Actividades Recientes</h5>
                            {actividadesPendientes.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Actividad</th>
                                                <th>Grupo</th>
                                                <th>Fecha</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {actividadesPendientes.slice(0, 5).map((actividad, index) => (
                                                <tr key={index}>
                                                    <td>{actividad.titulo}</td>
                                                    <td>{actividad.grupoNombre}</td>
                                                    <td>{actividad.fecha?.toDate().toLocaleDateString()}</td>
                                                    <td>
                                                        <span className="badge bg-warning">Pendiente</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted">No hay actividades pendientes</p>
                                    <button className="btn btn-primary">
                                        Crear Nueva Actividad
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Grupos Recientes</h5>
                            <div className="row">
                                {grupos.slice(0, 3).map(grupo => (
                                    <div key={grupo.id} className="col-md-4 mb-3">
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <h6 className="card-title">{grupo.nombre}</h6>
                                                <p className="card-text small text-muted">
                                                    {grupo.descripcion?.substring(0, 100)}...
                                                </p>
                                                <Link to={`/groups/${grupo.id}`} className="btn btn-sm btn-outline-primary">
                                                    Ver Detalles
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;