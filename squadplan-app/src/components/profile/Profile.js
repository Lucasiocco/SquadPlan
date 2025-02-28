import React, { useState, useEffect, useContext } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateEmail } from 'firebase/auth';
import { db, auth } from '../../services/firebase';
import { AuthContext } from '../../contexts/AuthContext';

const Profile = () => {
    const { currentUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        email: '',
        nombrePerfil: '',
        imagenPerfil: ''
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                if (!currentUser) {
                    throw new Error('Usuario no autenticado');
                }
                const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
                if (userDoc.exists()) {
                    setProfileData({ ...userDoc.data(), email: currentUser.email });
                } else {
                    setError('El perfil no existe.');
                }
            } catch (error) {
                setError('Error al cargar el perfil: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [currentUser]);

    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData({
                    ...profileData,
                    imagenPerfil: reader.result // Guardar la URL de la imagen
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await updateDoc(doc(db, 'usuarios', currentUser.uid), {
                nombrePerfil: profileData.nombrePerfil, // Guardar el nombre de perfil
                imagenPerfil: profileData.imagenPerfil // Guardar la imagen de perfil
            });
            if (profileData.email !== currentUser.email) {
                await updateEmail(auth.currentUser, profileData.email);
            }
            setSuccess('Perfil actualizado correctamente');
            setIsEditing(false);
        } catch (error) {
            setError('Error al actualizar el perfil: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center mt-5">Cargando...</div>;
    }

    return (
        <div className="container py-4">
            <h2 className="mb-4">Mi Perfil</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <div className="row">
                <div className="col-md-8 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="card-title mb-0">Información Personal</h4>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => setIsEditing(!isEditing)}
                                >
                                    {isEditing ? 'Cancelar' : 'Editar'}
                                </button>
                            </div>
                            <form onSubmit={handleUpdateProfile}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Nombre de Perfil</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nombrePerfil"
                                        value={profileData.nombrePerfil || ''}
                                        onChange={handleProfileChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Imagen de Perfil</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        onChange={handleImageChange}
                                        disabled={!isEditing}
                                    />
                                    {profileData.imagenPerfil && (
                                        <img
                                            src={profileData.imagenPerfil}
                                            alt="Imagen de perfil"
                                            className="img-thumbnail mt-2"
                                            style={{ width: '100px', height: '100px' }}
                                        />
                                    )}
                                </div>
                                {isEditing && (
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;