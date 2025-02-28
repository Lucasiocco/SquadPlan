import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { useParams } from 'react-router-dom';

const Activities = () => {
    const { groupId } = useParams();
    const { currentUser } = useContext(AuthContext);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const activitiesQuery = query(
                    collection(db, 'grupos', groupId, 'actividades'),
                    where('creadorId', '==', currentUser.uid)
                );

                const querySnapshot = await getDocs(activitiesQuery);
                const activitiesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setActivities(activitiesData);
            } catch (error) {
                console.error('Error al cargar actividades:', error);
                setError('Error al cargar actividades');
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [groupId, currentUser]);

    if (loading) {
        return <div className="text-center mt-5">Cargando...</div>;
    }

    if (error) {
        return <div className="text-center mt-5 text-danger">{error}</div>;
    }

    return (
        <div className="container mt-5">
            <h2>Actividades del Grupo</h2>
            {activities.length === 0 ? (
                <p>No hay actividades disponibles.</p>
            ) : (
                <ul className="list-group">
                    {activities.map(activity => (
                        <li key={activity.id} className="list-group-item">
                            <h5>{activity.titulo}</h5>
                            <p>{activity.descripcion}</p>
                            <p><strong>Fecha:</strong> {activity.fecha instanceof Date
                                ? activity.fecha.toLocaleDateString()
                                : activity.fecha ? new Date(activity.fecha).toLocaleDateString() : 'Fecha no válida'}</p>
                            <p><strong>Estado:</strong> {activity.estado}</p>
                            {/* Aquí podrías agregar botones para completar o eliminar la actividad */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Activities;