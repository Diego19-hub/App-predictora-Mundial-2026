import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authService";
import "./Register.css";

const AVATARS = [
    "avatar1.png",
    "avatar2.png",
    "avatar3.png",
    "avatar4.png",
];

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        avatar: "avatar1.png",
    });

    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        setForm({
        ...form,
        [e.target.name]: e.target.value,
        });
    };

    const validate = () => {
        const errors = {};

        if (!form.username.trim()) errors.username = "El nombre de usuario es obligatorio.";
        else if (form.username.trim().length < 3) errors.username = "Mínimo 3 caracteres.";

        if (!form.email.trim()) errors.email = "El correo electrónico es obligatorio.";
        else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Ingresa un correo válido.";

        if (!form.password.trim()) errors.password = "La contraseña es obligatoria.";
        else if (form.password.length < 6) errors.password = "Mínimo 6 caracteres.";

        if (!form.confirmPassword.trim()) errors.confirmPassword = "Confirma tu contraseña.";
        else if (form.password !== form.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden.";

        if (!form.avatar) errors.avatar = "Selecciona un avatar.";

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validate()) return;

        try {
        const response = await registerUser({
            username: form.username,
            email: form.email,
            password: form.password,
            avatar: form.avatar,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        navigate("/partidos");
        } catch (err) {
        setError(err.response?.data?.message || "Error al registrarse.");
        }
    };

    return (
        <div className="auth-page">
        <div className="auth-card">
            <h1>Crear Cuenta</h1>
            <p>Regístrate para empezar a hacer tus predicciones.</p>

            <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
                <label htmlFor="username">Nombre de usuario</label>
                <input
                id="username"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Tu nombre de usuario"
                required
                />
                {fieldErrors.username && <small>{fieldErrors.username}</small>}
            </div>

            <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tucorreo@ejemplo.com"
                required
                />
                {fieldErrors.email && <small>{fieldErrors.email}</small>}
            </div>

            <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Crea una contraseña"
                required
                />
                {fieldErrors.password && <small>{fieldErrors.password}</small>}
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                required
                />
                {fieldErrors.confirmPassword && <small>{fieldErrors.confirmPassword}</small>}
            </div>

            <div className="form-group">
                <label>Selecciona tu avatar</label>

                <div className="avatar-grid">
                {AVATARS.map((avatar) => (
                    <button
                    key={avatar}
                    type="button"
                    className={`avatar-option ${form.avatar === avatar ? "selected" : ""}`}
                    onClick={() => setForm({ ...form, avatar })}
                    >
                    <img src={`/public/${avatar}`} alt={avatar} />
                    </button>
                ))}
                </div>

                {fieldErrors.avatar && <small>{fieldErrors.avatar}</small>}
            </div>

            {error && <p className="general-error">{error}</p>}

            <button type="submit">Crear Cuenta</button>
            </form>

            <p>
            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
            </p>
        </div>
        </div>
    );
}

export default Register;