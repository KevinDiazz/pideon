import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Splash que se muestra al cargar la app por primera vez.
 * Hace ping al backend en /api/health y se cierra cuando responde.
 * Tiene un mínimo de 1.5s visible para que no parpadee si responde rápido,
 * y un máximo de 90s por si nunca responde.
 *
 * Muestra:
 *  - Logo
 *  - Spinner
 *  - Cronómetro de segundos transcurridos
 *  - Barra de progreso (estimando 60s)
 *  - Mensaje explicando que está alojado en Render
 */
const ESTIMATED_SECONDS = 60;
const MIN_VISIBLE_MS = 1500;
const MAX_VISIBLE_MS = 90_000;

const BackendWakeupSplash = () => {
  const [visible, setVisible] = useState(true);
  const [seconds, setSeconds] = useState(0);

  // Cronómetro
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [visible]);

  // Ping al backend + cierre del splash
  useEffect(() => {
    let cerrado = false;
    const startedAt = Date.now();
    const apiBase =
      import.meta.env.VITE_API_URL || "";
    const healthUrl = apiBase.replace(/\/$/, "") + "/health";

    const cerrar = () => {
      if (cerrado) return;
      cerrado = true;
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
      setTimeout(() => setVisible(false), wait);
    };

    // Intentamos despertar el backend
    fetch(healthUrl, { method: "GET" })
      .then((r) => {
        if (r.ok) cerrar();
        else cerrar(); // Aunque no esté ok, ya respondió → cerramos
      })
      .catch(() => {
        // Si falla el ping, cerramos al cabo del MAX_VISIBLE_MS
      });

    // Timeout de seguridad: aunque el backend nunca responda
    const safety = setTimeout(cerrar, MAX_VISIBLE_MS);
    return () => clearTimeout(safety);
  }, []);

  if (!visible) return null;

  const progress = Math.min(100, Math.round((seconds / ESTIMATED_SECONDS) * 100));
  const overEstimate = seconds > ESTIMATED_SECONDS;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-orange-100 p-8 text-center">
        <div className="text-5xl mb-2">🍕</div>
        <h1 className="text-3xl font-black text-orange-600 mb-1">PideON</h1>
        <p className="text-amber-900/70 text-sm mb-6">
          Cargando la app...
        </p>

        <div className="flex items-center justify-center gap-2 mb-4">
          <Loader2 size={20} className="animate-spin text-orange-600" />
          <span className="text-amber-900 font-semibold tabular-nums">
            {seconds} s
          </span>
        </div>

        <div className="mb-4">
          <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-amber-900/60 tabular-nums">
            <span>0 s</span>
            <span>~{ESTIMATED_SECONDS} s</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900/90 leading-relaxed text-left">
          <p className="font-semibold mb-1">¿Por qué tarda tanto?</p>
          <p>
            Esta web está alojada en{" "}
            <strong>Render</strong> con plan gratuito, que duerme el servidor
            tras 15 min sin uso. La primera carga tarda entre{" "}
            <strong>30 y 60 segundos</strong> en despertar.
            {overEstimate && (
              <> Está tardando más de lo habitual, espera unos segundos más.</>
            )}
          </p>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="mt-4 text-xs text-amber-900/60 hover:text-amber-900 underline"
        >
          Saltar y entrar igualmente
        </button>
      </div>
    </div>
  );
};

export default BackendWakeupSplash;
