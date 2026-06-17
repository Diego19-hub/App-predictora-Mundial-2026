import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyProfile } from "../../services/userService";
import "./Perfil.css";

function Perfil() {
    const navigate = useNavigate();
    const { user: authUser, logout } = useAuth();

    const [user, setUser] = useState(authUser);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMyProfile();
            const data = response.data.user || response.data.data || response.data;

            setUser(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "No se pudo cargar el perfil.");
        } finally {
            setLoading(false);
        }
        };

        loadProfile();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const username = user?.username || user?.name || "Usuario";
    const email = user?.email || "correo@ejemplo.com";
    const avatar = user?.avatar ? `/public/${user.avatar}` : "/avatars/avatar1.png";
    const points = user?.total_points ?? 0;

    if (loading) return <h1 className="page-message">Cargando perfil...</h1>;
    if (error) return <h1 className="page-message page-message--error">{error}</h1>;

    return (
        <div className="profile-page">
        <main className="profile-content">
            <h1 className="page-title">Perfil</h1>
            <p className="page-subtitle">Tu información de cuenta.</p>

            <section className="profile-card">
            <div className="profile-header">
                <img src={avatar} alt={username} className="profile-avatar" />
                <div>
                <h2>{username}</h2>
                <p>{email}</p>
                </div>
            </div>

            <div className="profile-stats">
                <article className="profile-stat">
                <span>Puntos</span>
                <strong>{points}</strong>
                </article>

                <article className="profile-stat">
                <span>Predicciones</span>
                <strong>0</strong>
                </article>

                <article className="profile-stat">
                <span>Aciertos</span>
                <strong>0</strong>
                </article>
            </div>

            <div className="profile-actions">
                <button type="button" onClick={() => navigate("/perfil/editar")}>
                Cambiar avatar
                </button>

                <button type="button" onClick={() => navigate("/perfil/cambiar-password")}>
                Cambiar contraseña
                </button>

                <button type="button" className="danger" onClick={handleLogout}>
                Cerrar sesión
                </button>
            </div>
            </section>
        </main>
        </div>
    );
}

export default Perfil;