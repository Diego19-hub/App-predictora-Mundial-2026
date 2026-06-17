import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, updateAvatar } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

const AVATARS = [
    "avatar1.png",
    "avatar2.png",
    "avatar3.png",
    "avatar4.png",
    ];

    function EditarAvatar() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [currentUser, setCurrentUser] = useState(null);
    const [selectedAvatar, setSelectedAvatar] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await getMyProfile();
            const user = response.data.user || response.data.data || response.data;

            setCurrentUser(user);
            setSelectedAvatar(user.avatar || "avatar1.png");
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo cargar el perfil.");
        } finally {
            setLoading(false);
        }
        };

        loadProfile();
    }, []);

    const handleSave = async () => {
        try {
        setSaving(true);
        setError("");

        const response = await updateAvatar(selectedAvatar);
        const updatedUser = response.data.user || response.data.data || response.data;

        login(localStorage.getItem("token"), {
            ...(currentUser || {}),
            ...updatedUser,
            avatar: selectedAvatar,
        });

        navigate("/perfil");
        } catch (err) {
        setError(err.response?.data?.message || "No se pudo actualizar el avatar.");
        } finally {
        setSaving(false);
        }
    };

    if (loading) return <h1>Cargando...</h1>;
    if (error && !currentUser) return <h1>{error}</h1>;

    return (
        <div style={{ padding: "28px" }}>
        <h1>Cambiar avatar</h1>
        <p>Elige una imagen para tu perfil.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px", maxWidth: "700px" }}>
            {AVATARS.map((avatar) => (
            <button
                key={avatar}
                type="button"
                onClick={() => setSelectedAvatar(avatar)}
                style={{
                padding: "12px",
                borderRadius: "16px",
                border: selectedAvatar === avatar ? "2px solid #2563eb" : "1px solid #cbd5e1",
                background: "#fff",
                cursor: "pointer",
                }}
            >
                <img src={`/${avatar}`} alt={avatar} width="72" height="72" style={{ borderRadius: "50%" }} />
            </button>
            ))}
        </div>

        {error && <p style={{ color: "red", marginTop: "16px" }}>{error}</p>}

        <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
            <button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar avatar"}
            </button>

            <button type="button" onClick={() => navigate("/perfil")}>
            Cancelar
            </button>
        </div>
        </div>
    );
}

export default EditarAvatar;