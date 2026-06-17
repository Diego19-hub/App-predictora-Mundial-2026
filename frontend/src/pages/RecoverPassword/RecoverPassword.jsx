import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../services/authService";

function RecoverPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!email.trim()) {
        setError("Ingresa tu correo.");
        return;
        }

        try {
        setLoading(true);
        const response = await requestPasswordReset(email.trim());
        setMessage(response.data.message || "Revisa tu correo para continuar.");
        } catch (err) {
        setError(err.response?.data?.message || "No se pudo enviar la solicitud.");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div style={{ padding: "28px" }}>
        <h1>Recuperar contraseña</h1>
        <p>Escribe tu correo y te enviaremos instrucciones.</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px", maxWidth: "420px" }}>
            <input
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />

            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}

            <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar enlace"}
            </button>
        </form>

        <p style={{ marginTop: "16px" }}>
            <Link to="/login">Volver al login</Link>
        </p>
        </div>
    );
}

export default RecoverPassword;