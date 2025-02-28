import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { AuthContext } from '../../contexts/AuthContext';

const GroupDetail = () => {
  const { groupId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [membersData, setMembersData] = useState({});
  const [newActivity, setNewActivity] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
  });

  const [completedActivities, setCompletedActivities] = useState([]);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const groupDoc = await getDoc(doc(db, 'grupos', groupId));
        if (groupDoc.exists()) {
          setGroup({ id: groupDoc.id, ...groupDoc.data() });
          await fetchMembersData(groupDoc.data().miembros);
        } else {
          navigate('/groups');
        }
      } catch (error) {
        console.error('Error al cargar el grupo:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMembersData = async (members) => {
      const membersInfo = {};
      for (const memberId of members) {
        const userDoc = await getDoc(doc(db, 'usuarios', memberId));
        if (userDoc.exists()) {
          membersInfo[memberId] = userDoc.data().nombrePerfil; // Asumiendo que 'nombrePerfil' es el campo que contiene el nombre
        }
      }
      setMembersData(membersInfo);
    };

    fetchGroup();
  }, [groupId, navigate]);

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      const fechaDate = new Date(newActivity.fecha);
      const activityData = {
        ...newActivity,
        creadorId: currentUser.uid,
        fechaCreacion: new Date(),
        estado: 'pendiente',
        votos: [],
        fecha: fechaDate,
        id: doc(collection(db, 'grupos', groupId, 'actividades')).id // Generar un ID único
      };
  
      await updateDoc(doc(db, 'grupos', groupId), {
        actividades: arrayUnion(activityData)
      });
  
      setNewActivity({ titulo: '', descripcion: '', fecha: '' });
      setGroup(prevGroup => ({
        ...prevGroup,
        actividades: [...(prevGroup.actividades || []), activityData]
      }));
    } catch (error) {
      console.error('Error al añadir actividad:', error);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      // Eliminar la actividad de Firestore usando solo el ID
      await updateDoc(doc(db, 'grupos', groupId), {
        actividades: arrayRemove(group.actividades.find(activity => activity.id === activityId))
      });
  
      // Actualizar el estado local
      setGroup(prevGroup => ({
        ...prevGroup,
        actividades: prevGroup.actividades.filter(activity => activity.id !== activityId),
      }));
    } catch (error) {
      console.error('Error al eliminar actividad:', error);
    }
  };

  const handleCompleteActivity = async (activityId) => {
    const activityToComplete = group.actividades.find(activity => activity.id === activityId);
    if (activityToComplete) {
      // Actualizar el estado de la actividad a completada
      await updateDoc(doc(db, 'grupos', groupId), {
        actividades: arrayRemove(activityToComplete)
      });

      setCompletedActivities(prev => [...prev, { ...activityToComplete, estado: 'completada' }]);
      setGroup(prevGroup => ({
        ...prevGroup,
        actividades: prevGroup.actividades.filter(activity => activity.id !== activityId),
      }));
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  if (!group) {
    return <div className="text-center mt-5">Grupo no encontrado.</div>;
  } 


  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h2>{group.nombre}</h2>
              <p className="text-muted">{group.descripcion}</p>

              <div className="mt-4">
                <h4>Miembros</h4>
                <div className="d-flex flex-wrap gap-2">
                  {group.miembros?.map((miembro) => (
                    <span key={miembro} className="badge bg-primary">
                       {membersData[miembro] || 'Cargando...'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Actividades */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h4>Actividades</h4>
              {group.actividades?.length > 0 ? (
                <div className="list-group">
                  {group.actividades.map((actividad) => (
                    <div key={actividad.id} className="list-group-item">
                      <h5>{actividad.titulo}</h5>
                      <p className="mb-1">{actividad.descripcion}</p>
                      <small className="text-muted">
                        Fecha: {actividad.fecha instanceof Date
                          ? actividad.fecha.toLocaleDateString()
                          : new Date(actividad.fecha).toLocaleDateString() || 'Fecha no válida'}
                      </small>
                      <button 
                        className="btn btn-success btn-sm mt-2" 
                        onClick={() => handleCompleteActivity(actividad.id)}
                      >
                        Completar
                      </button>
                      <button 
                        className="btn btn-danger btn-sm mt-2" 
                        onClick={() => handleDeleteActivity(actividad.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No hay actividades programadas</p>
              )}
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h4>Actividades Completadas</h4>
              {completedActivities.length > 0 ? (
                <div className="list-group">
                  {completedActivities.map((actividad) => (
                    <div key={actividad.id} className="list-group-item">
                      <h5>{actividad.titulo}</h5>
                      <p className="mb-1">{actividad.descripcion}</p>
                      <small className="text-muted">
                        Fecha: {actividad.fecha instanceof Date
                          ? actividad.fecha.toLocaleDateString()
                          : new Date(actividad.fecha).toLocaleDateString() || 'Fecha no válida'}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No hay actividades completadas</p>
              )}
            </div>
          </div>
          
        </div>




        {/* Panel lateral */}
        <div className="col-md-4">
          {/* Formulario para nueva actividad */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h4>Nueva Actividad</h4>
              <form onSubmit={handleAddActivity}>
                <div className="mb-3">
                  <label className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newActivity.titulo}
                    onChange={(e) => setNewActivity({
                      ...newActivity,
                      titulo: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    value={newActivity.descripcion}
                    onChange={(e) => setNewActivity({
                      ...newActivity,
                      descripcion: e.target.value
                    })}
                    rows="3"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newActivity.fecha}
                    onChange={(e) => setNewActivity({
                      ...newActivity,
                      fecha: e.target.value // Esto capturará la fecha como una cadena
                    })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Añadir Actividad
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;