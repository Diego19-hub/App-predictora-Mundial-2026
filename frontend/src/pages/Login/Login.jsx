import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        identifier: "",
        password: "",
    });

    const [fieldErrors, setFieldErrors] = useState({
        identifier: "",
        password: "",
    });

    const [generalError, setGeneralError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    const validate = () => {
        const errors = {
        identifier: "",
        password: "",
        };

        if (!form.identifier.trim()) errors.identifier = "Ingresa tu correo o usuario.";
        if (!form.password.trim()) errors.password = "Ingresa tu contraseña.";
        else if (form.password.length < 6) errors.password = "La contraseña debe tener al menos 6 caracteres.";

        setFieldErrors(errors);
        return !errors.identifier && !errors.password;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError("");

        if (!validate()) return;

        try {
        setLoading(true);

        const response = await loginUser(form);

        login(response.data.token, response.data.user);
        navigate("/partidos");
        } catch (error) {
        setGeneralError(error.response?.data?.message || "No se pudo iniciar sesión.");
        } finally {
        setLoading(false);
        }
    };

    return (
    
    <div className="auth-page">
        <div className="auth-card">
        <div className="auth-header">
            <div className="auth-logo">⚽</div>
            <h1>Iniciar Sesión</h1>
            <p>Accede a tu cuenta para hacer y ver tus predicciones.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
            <label htmlFor="identifier">Correo o usuario</label>
            <input
                id="identifier"
                type="text"
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                placeholder="Correo o nombre de usuario"
                autoComplete="username"
                required
            />
            {fieldErrors.identifier && <small className="field-error">{fieldErrors.identifier}</small>}
            </div>

            <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                required
            />
            {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
            </div>

            {generalError && <p className="general-error" role="alert">{generalError}</p>}

            <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
        </form>

        <div className="auth-links">
            <p>
            ¿No tienes cuenta? <Link to="/register">Registrarte</Link>
            </p>
            <p>
            <Link to="/recover-password">Recuperar contraseña</Link>
            </p>
        </div>
        </div>
    </div>
    );
}

export default Login;