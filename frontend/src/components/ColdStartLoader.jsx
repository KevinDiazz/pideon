import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Indicador de "cold start" para cuando el backend en Render
 * está despertando. Muestra cronómetro, barra de progreso (estima 60s)
 * y un botón de reintentar. Si onRetry se pasa, el componente vuelve
 * a llamar al fetch al pulsar el botón. También se reintenta solo
 * cada `autoRetryMs` ms (por defecto 8s).
 *
 * Variantes:
 *  - variant="full" (por defecto): tarjeta grande con texto, cronómetro y barra.
 *  - variant="compact": versión reducida para sidebars o lugares estrechos.
 */
const ESTIMATED_SECONDS = 60;

const ColdStartLoader = ({
  onRetry,
  autoRetryMs = 8000,
  variant = "full",
}) => {
  const [seconds, setSeconds] = useState(0);

  // Cronómetro
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-reintento
  useEffect(() => {
    if (!onRetry) return;
    const id = setInterval(() => onRetry(), autoRetryMs);
    return () => clearInterval(id);
  }, [onRetry, autoRetryMs]);

  const progress = Math.min(100, Math.round((seconds / ESTIMATED_SECONDS) * 100));
  const overEstimate = seconds > ESTIMATED_SECONDS;

  if (variant === "compact") {
    return (
      <div className="text-xs text-amber-900/80 leading-relaxed">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Loader2 size={12} className="animate-spin text-orange-600" />
          <span className="font-semibold">Despertando servidor…</span>
        </div>
        <p className="mb-2">
          Render duerme el backend tras 15 min sin uso.
          {overEstimate
            ? " Está tardando más de lo habitual."
            : " La primera carga tarda 30–60 s."}
        </p>
        <div className="h-1 bg-orange-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[10px] mt-1 text-amber-900/60 tabular-nums">
          {seconds} s
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-5 rounded-2xl">
      <div className="flex items-center gap-2 mb-2">
        <Loader2 size={18} className="animate-spin text-orange-600" />
        <p className="font-semibold">El servidor está despertando…</p>
      </div>

      <p className="text-sm text-amber-900/80 mb-3">
        Esta app usa el plan gratuito de Render, que apaga el backend tras
        unos minutos sin tráfico. La primera petición puede tardar entre{" "}
        <strong>30 y 60 segundos</strong> en arrancar.
        {overEstimate && (
          <>
            {" "}
            Está tardando más de lo habitual — puede que el servidor esté
            arrancando lento, espera unos segundos más.
          </>
        )}
      </p>

      <div className="mb-2">
        <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-amber-900/70 tabular-nums">
          <span>Esperando {seconds} s</span>
          <span>~{ESTIMATED_SECONDS} s estimados</span>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={() => onRetry()}
          className="mt-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm"
        >
          Reintentar ahora
        </button>
      )}
    </div>
  );
};

export default ColdStartLoader;
