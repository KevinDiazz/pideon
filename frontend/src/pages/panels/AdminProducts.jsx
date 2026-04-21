import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  ImagePlus,
  UploadCloud,
  ImageOff,
} from "lucide-react";
import { productsService } from "../../services/productsService";
import { categoriesService } from "../../services/categoriesService";
import ConfirmDialog from "../../components/ConfirmDialog";

const emptyForm = {
  nombre: "",
  descripcion: "",
  precio: "",
  categoria_id: "",
};

const MAX_IMAGE_MB = 5;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/**
 * Drop-zone con preview para el selector de imagen del producto.
 * Acepta drag & drop, click para abrir el file picker, muestra el archivo
 * elegido con tamaño y permite quitarlo. Si se está editando un producto y
 * no se ha elegido un archivo nuevo, muestra la imagen actual.
 */
const ImageDropzone = ({ file, onFile, currentUrl }) => {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [localError, setLocalError] = useState(null);

  const preview = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return null;
  }, [file]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const validate = (f) => {
    if (!ACCEPTED.includes(f.type)) {
      return "Formato no soportado (usa JPG, PNG, WEBP o GIF).";
    }
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
      return `La imagen supera los ${MAX_IMAGE_MB}MB.`;
    }
    return null;
  };

  const handle = (f) => {
    if (!f) return;
    const err = validate(f);
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    onFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    handle(f);
  };

  const showingPreview = !!preview;
  const showingCurrent = !preview && !!currentUrl;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />

      {showingPreview || showingCurrent ? (
        <div className="relative border-2 border-orange-200 rounded-xl p-3 bg-orange-50/40">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-orange-100 flex-shrink-0">
              <img
                src={showingPreview ? preview : currentUrl}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900 truncate">
                {showingPreview ? file.name : "Imagen actual"}
              </p>
              <p className="text-xs text-amber-900/70">
                {showingPreview
                  ? `${(file.size / 1024).toFixed(0)} KB`
                  : "Elige un archivo para reemplazarla"}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-xs font-semibold px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-700 text-white inline-flex items-center gap-1"
                >
                  <ImagePlus size={14} /> Cambiar
                </button>
                {showingPreview && (
                  <button
                    type="button"
                    onClick={() => onFile(null)}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-white border border-orange-200 text-amber-900 hover:bg-orange-50 inline-flex items-center gap-1"
                  >
                    <ImageOff size={14} /> Quitar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`w-full border-2 border-dashed rounded-xl px-4 py-6 flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
            drag
              ? "border-orange-500 bg-orange-50"
              : "border-orange-200 hover:border-orange-400 hover:bg-orange-50/60"
          }`}
        >
          <UploadCloud className="text-orange-500" size={28} />
          <p className="font-semibold text-amber-900 text-sm">
            Arrastra una imagen o haz clic
          </p>
          <p className="text-xs text-amber-900/60">
            JPG, PNG, WEBP · hasta {MAX_IMAGE_MB}MB
          </p>
        </button>
      )}

      {localError && (
        <p className="mt-2 text-xs text-red-600 font-semibold">{localError}</p>
      )}
    </div>
  );
};

const AdminProducts = () => {
  const qc = useQueryClient();

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productsService.list,
  });
  const { data: categorias = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesService.list,
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // producto o null
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [confirmProd, setConfirmProd] = useState(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["products"] });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFile(null);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precio: String(p.precio),
      categoria_id: String(p.categoria_id),
    });
    setFile(null);
    setError(null);
    setShowForm(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: form.precio,
        categoria_id: form.categoria_id,
      };
      if (editing) {
        return productsService.update(editing.id, payload, file);
      }
      return productsService.create(payload, file);
    },
    onSuccess: () => {
      setShowForm(false);
      setError(null);
      invalidate();
    },
    onError: (err) =>
      setError(err.response?.data?.message || "Error al guardar producto"),
  });

  const remove = useMutation({
    mutationFn: (id) => productsService.remove(id),
    onSuccess: invalidate,
    onError: (err) =>
      setError(err.response?.data?.message || "Error al eliminar"),
  });

  const catName = (id) => categorias.find((c) => c.id === id)?.nombre || "—";

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-amber-900/70 text-sm">
          {productos.length} productos
        </p>
        <button
          onClick={openCreate}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-orange-100 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-amber-900">
              {editing ? `Editar: ${editing.nombre}` : "Nuevo producto"}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-amber-900/70 hover:text-amber-900"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Nombre
              </label>
              <input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border border-orange-200 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Categoría
              </label>
              <select
                value={form.categoria_id}
                onChange={(e) =>
                  setForm({ ...form, categoria_id: e.target.value })
                }
                className="w-full border border-orange-200 rounded-lg px-3 py-2"
              >
                <option value="">Selecciona...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Descripción
              </label>
              <textarea
                rows={2}
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                className="w-full border border-orange-200 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Precio (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className="w-full border border-orange-200 rounded-lg px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Imagen {editing && "(opcional, reemplaza la actual)"}
              </label>
              <ImageDropzone
                file={file}
                onFile={setFile}
                currentUrl={editing?.imagen_url}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={() => save.mutate()}
              disabled={
                save.isPending ||
                !form.nombre ||
                !form.precio ||
                !form.categoria_id
              }
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg"
            >
              {save.isPending ? "Guardando..." : editing ? "Guardar" : "Crear"}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-amber-900/70">Cargando...</p>
      ) : productos.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-2xl p-8 text-center text-amber-900/60 italic">
          No hay productos.
        </div>
      ) : (
        <>
          {/* Tabla — visible en ≥md */}
          <div className="hidden md:block bg-white border border-orange-100 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-orange-50 text-amber-900">
                <tr>
                  <th className="p-3 font-semibold">Imagen</th>
                  <th className="p-3 font-semibold">Nombre</th>
                  <th className="p-3 font-semibold">Categoría</th>
                  <th className="p-3 font-semibold">Precio</th>
                  <th className="p-3 font-semibold">Disponible</th>
                  <th className="p-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id} className="border-t border-orange-100">
                    <td className="p-3">
                      <div className="w-12 h-12 rounded-lg bg-orange-50 overflow-hidden flex items-center justify-center">
                        {p.imagen_url ? (
                          <img
                            src={p.imagen_url}
                            alt={p.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>🍽️</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-amber-900">
                      {p.nombre}
                    </td>
                    <td className="p-3 text-amber-900/80">
                      {catName(p.categoria_id)}
                    </td>
                    <td className="p-3 font-semibold text-orange-600">
                      {Number(p.precio).toFixed(2)} €
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          p.disponible
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {p.disponible ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmProd(p)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas apiladas — móvil */}
          <div className="md:hidden space-y-3">
            {productos.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-orange-100 rounded-2xl p-3 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-orange-50 overflow-hidden flex items-center justify-center shrink-0">
                    {p.imagen_url ? (
                      <img
                        src={p.imagen_url}
                        alt={p.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-amber-900 truncate">
                        {p.nombre}
                      </p>
                      <span className="text-orange-600 font-black whitespace-nowrap">
                        {Number(p.precio).toFixed(2)} €
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/70 mt-0.5">
                      {catName(p.categoria_id)}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          p.disponible
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {p.disponible ? "Disponible" : "No disponible"}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="bg-orange-100 hover:bg-orange-200 text-orange-700 p-1.5 rounded"
                          title="Editar"
                          aria-label="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmProd(p)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 p-1.5 rounded"
                          title="Eliminar"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!confirmProd}
        title="Eliminar producto"
        message={
          confirmProd
            ? `"${confirmProd.nombre}" dejará de estar disponible en la carta. Esta acción no elimina los pedidos pasados. ¿Continuar?`
            : ""
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        tone="danger"
        loading={remove.isPending}
        onCancel={() => setConfirmProd(null)}
        onConfirm={() => {
          if (!confirmProd) return;
          const id = confirmProd.id;
          remove.mutate(id, {
            onSettled: () => setConfirmProd(null),
          });
        }}
      />
    </div>
  );
};

export default AdminProducts;
