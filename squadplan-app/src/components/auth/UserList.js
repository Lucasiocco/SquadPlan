import React, { useState, useEffect, useContext } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { AuthContext } from '../../contexts/AuthContext';

const UserList = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]); // Estado para la lista de usuarios
  const [searchEmail, setSearchEmail] = useState(''); // Estado para el email de búsqueda
  const [friends, setFriends] = useState([]); // Estado para la lista de amigos
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'usuarios');
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData); // Cargar usuarios desde la base de datos
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Cargar amigos desde localStorage al iniciar el componente
    const storedFriends = JSON.parse(localStorage.getItem('friends')) || [];
    setFriends(storedFriends);
  }, []);

  const handleSearch = (e) => {
    setSearchEmail(e.target.value);
  };

  const addFriend = (user) => {
    setFriends(prevFriends => {
      const updatedFriends = [...prevFriends, user];
      localStorage.setItem('friends', JSON.stringify(updatedFriends)); // Guardar amigos en localStorage
      return updatedFriends;
    });
    setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id)); // Eliminar usuario de la lista de búsqueda
    setSearchEmail(''); // Limpiar el campo de búsqueda
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  const filteredUsers = users.filter(user => 
    user.email.includes(searchEmail) && user.email !== currentUser?.email // Excluir al usuario actual
  );


  return (
    <div>
      <input
        type="text"
        placeholder="Buscar por email"
        value={searchEmail}
        onChange={handleSearch}
      />
      <ul>
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <li key={user.id}>
              {user.email}
              <button onClick={() => addFriend(user)}>Agregar como amigo</button>
            </li>
          ))
        ) : (
          <li>No se encontraron usuarios.</li>
        )}
      </ul>
      <h3>Amigos:</h3>
      <ul>
        {friends.map(friend => (
          <li key={friend.id}>{friend.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;