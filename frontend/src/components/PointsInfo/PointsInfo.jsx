import { useState } from "react";
import "./PointsInfo.css";

function PointsInfo() {
    const [open, setOpen] = useState(false);

    return (
        <div className="points-info">
        <button
            className="points-info__button"
            onClick={() => setOpen(!open)}
            title="Sistema de puntos"
        >
            🔔
        </button>

        {open && (
            <div className="points-info__popup">
            <h3>¿Cómo funciona el puntaje?</h3>

            <div className="points-rule">
                <span>🎯 Resultado exacto</span>
                <strong>5 pts</strong>
            </div>

            <div className="points-rule">
                <span>⚽ Diferencia correcta</span>
                <strong>3 pts</strong>
            </div>

            <div className="points-rule">
                <span>🏆 Ganador correcto</span>
                <strong>1 pt</strong>
            </div>

            <div className="points-rule">
                <span>❌ Pronóstico incorrecto</span>
                <strong>0 pts</strong>
            </div>
            </div>
        )}
        </div>
    );
}

export default PointsInfo;