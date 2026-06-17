import "./ProfileCard.css";

function ProfileCard({ user }) {
    const avatar = user?.avatar || "/avatar1.png";

    return (
        <article className="profile-card">
        <div className="profile-card__header">
            <img src={avatar} alt="Avatar del usuario" className="profile-card__avatar" />

            <div className="profile-card__info">
            <h2>{user?.username || "Usuario"}</h2>
            <p>{user?.email || "correo@ejemplo.com"}</p>
            </div>
        </div>

        <div className="profile-card__stats">
            <div className="stat-box">
            <span>Partidos</span>
            <strong>12</strong>
            </div>

            <div className="stat-box">
            <span>Aciertos</span>
            <strong>10</strong>
            </div>

            <div className="stat-box">
            <span>Puntos</span>
            <strong>52</strong>
            </div>
        </div>

        <div className="profile-card__actions">
            <button type="button">Cambiar avatar</button>
            <button type="button">Cambiar contraseña</button>
            <button type="button" className="danger">
            Cerrar sesión
            </button>
        </div>
        </article>
    );
}

export default ProfileCard;