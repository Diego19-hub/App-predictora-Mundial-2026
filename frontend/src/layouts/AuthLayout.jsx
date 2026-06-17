import { Link } from "react-router-dom";
import "./AuthLayout.css";

function AuthLayout({ children }) {
    return (
        <div className="auth-layout">
        <header className="auth-layout__header">
            <div className="auth-layout__brand">
            <img
                src="/logo-mundial-2026.png"
                alt="Logo Mundial 2026"
                className="auth-layout__logo"
            />
            <span>Mundial 2026</span>
            </div>

            <nav className="auth-layout__nav">
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
            </nav>
        </header>

        <main className="auth-layout__main">
            {children}
        </main>
        </div>
    );
}

export default AuthLayout;