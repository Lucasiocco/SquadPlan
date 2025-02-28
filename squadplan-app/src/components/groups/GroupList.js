import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const GroupList = () => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const q = query(
          collection(db, 'grupos'),
          where('miembros', 'array-contains', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const gruposData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setGrupos(gruposData);
      } catch (error) {
        console.error('Error al cargar grupos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrupos();
  }, [currentUser]);

  if (loading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Mis Grupos</h2>
      <div className="row">
        {grupos.map(grupo => (
          <div key={grupo.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{grupo.nombre}</h5>
                <p className="card-text">{grupo.descripcion}</p>
                <Link 
                  to={`/groups/${grupo.id}`} 
                  className="btn btn-primary"
                >
                  Ver Detalles
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {grupos.length === 0 && (
        <div className="text-center mt-4">
          <p>No perteneces a ningún grupo todavía.</p>
          <Link to="/create-group" className="btn btn-primary">
            Crear un Grupo
          </Link>
        </div>
      )}
    </div>
  );
};

export default GroupList;