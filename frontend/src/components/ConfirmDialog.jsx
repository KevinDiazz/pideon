import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

/**
 * Modal de confirmación reutilizable.
 *
 * Uso (patrón recomendado con estado):
 *   const [confirm, setConfirm] = useState(null);
 *   ...
 *   <ConfirmDialog
 *     open={!!confirm}
 *     title={confirm?.title}
 *     message={confirm?.message}
 *     confirmLabel={confirm?.confirmLabel}
 *     tone={confirm?.tone}
 *     loading={confirm?.loading}
 *     onCancel={() => setConfirm(null)}
 *     onConfirm={() => { confirm?.onConfirm(); setConfirm(null); }}
 *   />
 */
const toneClasses = {
  danger: {
    icon: "bg-red-100 text-red-600",
    btn: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: "bg-amber-100 text-amber-700",
    btn: "bg-amber-600 hover:bg-amber-700",
  },
  primary: {
    icon: "bg-orange-100 text-orange-600",
    btn: "bg-orange-600 hover:bg-orange-700",
  },
};

const ConfirmDialog = ({
  open,
  title = "¿Estás seguro?",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onCancel?.();
      if (e.key === "Enter" && !loading) onConfirm?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel, onConfirm]);

  if (!open) return null;

  const t = toneClasses[tone] || toneClasses.danger;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
      onClick={() => !loading && onCancel?.()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden"
      >
        <div className="p-5 flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${t.icon}`}
          >
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-black text-amber-900 text-lg leading-tight">
                {title}
              </h3>
              <button
                onClick={() => !loading && onCancel?.()}
                className="text-amber-900/50 hover:text-amber-900"
              >
                <X size={18} />
              </button>
            </div>
            {message && (
              <p className="text-sm text-amber-900/80 mt-1 leading-relaxed">
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="bg-orange-50/60 px-5 py-3 flex justify-end gap-2 border-t border-orange-100">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg font-semibold text-amber-900 bg-white border border-orange-200 hover:bg-orange-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-semibold text-white ${t.btn} disabled:opacity-60`}
          >
            {loading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
