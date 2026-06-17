import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();

    const avatar = user?.avatar || "avatar1.png";
    const isAdmin = user?.role === "diego" || user?.email === "diego@email.com";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="navbar">
            <div className="navbar__brand" onClick={() => navigate("/partidos")}>
                <img src="/logo-mundial-2026.png" alt="Logo Mundial 2026" className="navbar__logo" />
                <span>Mundial 2026</span>
            </div>

            <nav className="navbar__links">
                <Link to="/partidos">Partidos</Link>
                <Link to="/predicciones">Mis Predicciones</Link>
                <Link to="/clasificacion">Clasificación</Link>
            </nav>

            <div className="navbar__user">
                <button className="navbar__avatarBtn" onClick={() => setOpen(!open)}>
                    <img src={`/${avatar}`} alt="Avatar" className="navbar__avatar" />
                    <span className="navbar__arrow">▼</span>
                </button>

                {open && (
                    <div className="navbar__dropdown">
                        <Link to="/perfil" onClick={() => setOpen(false)}>
                            Perfil
                        </Link>

                        {isAdmin && (
                            <Link to="/admin/resultados" onClick={() => setOpen(false)}>
                                Administrar Resultados
                            </Link>
                        )}

                        <button onClick={handleLogout}>Cerrar Sesión</button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Navbar;