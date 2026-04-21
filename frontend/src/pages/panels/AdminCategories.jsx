import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";
import { categoriesService } from "../../services/categoriesService";
import ConfirmDialog from "../../components/ConfirmDialog";

const AdminCategories = () => {
  const qc = useQueryClient();
  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesService.list,
  });

  const [nueva, setNueva] = useState({ nombre: "", descripcion: "" });
  const [editId, setEditId] = useState(null);
  const [editDraft, setEditDraft] = useState({ nombre: "", descripcion: "" });
  const [error, setError] = useState(null);
  const [confirmCat, setConfirmCat] = useState(null); // categoría a desactivar

  const invalidate = () => qc.invalidateQueries({ queryKey: ["categories"] });

  const create = useMutation({
    mutationFn: (payload) => categoriesService.create(payload),
    onSuccess: () => {
      setNueva({ nombre: "", descripcion: "" });
      setError(null);
      invalidate();
    },
    onError: (err) =>
      setError(err.response?.data?.message || "Error al crear categoría"),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => categoriesService.update(id, payload),
    onSuccess: () => {
      setEditId(null);
      setError(null);
      invalidate();
    },
    onError: (err) =>
      setError(err.response?.data?.message || "Error al actualizar"),
  });

  const remove = useMutation({
    mutationFn: (id) => categoriesService.remove(id),
    onSuccess: invalidate,
    onError: (err) =>
      setError(err.response?.data?.message || "Error al eliminar"),
  });

  const startEdit = (cat) => {
    setEditId(cat.id);
    setEditDraft({ nombre: cat.nombre, descripcion: cat.descripcion || "" });
  };

  return (
    <div>
      {/* Crear */}
      <div className="bg-white border border-orange-100 rounded-2xl p-4 mb-6">
        <h3 className="font-bold text-amber-900 mb-3">Nueva categoría</h3>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
          <input
            placeholder="Nombre"
            value={nueva.nombre}
            onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })}
            className="border border-orange-200 rounded-lg px-3 py-2"
          />
          <input
            placeholder="Descripción (opcional)"
            value={nueva.descripcion}
            onChange={(e) =>
              setNueva({ ...nueva, descripcion: e.target.value })
            }
            className="border border-orange-200 rounded-lg px-3 py-2"
          />
          <button
            onClick={() => nueva.nombre && create.mutate(nueva)}
            disabled={create.isPending || !nueva.nombre}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold px-4 rounded-lg inline-flex items-center gap-2 justify-center"
          >
            <Plus size={16} /> Crear
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-amber-900/70">Cargando...</p>
      ) : categorias.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-2xl p-6 text-center text-amber-900/60 italic">
          No hay categorías todavía.
        </div>
      ) : (
        <>
          {/* Tabla — desktop */}
          <div className="hidden md:block bg-white border border-orange-100 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-orange-50 text-amber-900">
                <tr>
                  <th className="p-3 font-semibold">ID</th>
                  <th className="p-3 font-semibold">Nombre</th>
                  <th className="p-3 font-semibold">Descripción</th>
                  <th className="p-3 font-semibold">Activa</th>
                  <th className="p-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id} className="border-t border-orange-100">
                    <td className="p-3 text-amber-900/70">{c.id}</td>
                    <td className="p-3">
                      {editId === c.id ? (
                        <input
                          value={editDraft.nombre}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, nombre: e.target.value })
                          }
                          className="border border-orange-200 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <span className="font-semibold text-amber-900">
                          {c.nombre}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-amber-900/80">
                      {editId === c.id ? (
                        <input
                          value={editDraft.descripcion}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              descripcion: e.target.value,
                            })
                          }
                          className="border border-orange-200 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        c.descripcion || "—"
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          c.activa
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {c.activa ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        {editId === c.id ? (
                          <>
                            <button
                              onClick={() =>
                                update.mutate({ id: c.id, payload: editDraft })
                              }
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded"
                              title="Guardar"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                              title="Cancelar"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(c)}
                              className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setConfirmCat(c)}
                              className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                              title="Desactivar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas apiladas — móvil */}
          <div className="md:hidden space-y-3">
            {categorias.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-orange-100 rounded-2xl p-3 shadow-sm"
              >
                {editId === c.id ? (
                  <div className="space-y-2">
                    <input
                      placeholder="Nombre"
                      value={editDraft.nombre}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, nombre: e.target.value })
                      }
                      className="border border-orange-200 rounded-lg px-3 py-2 w-full"
                    />
                    <input
                      placeholder="Descripción"
                      value={editDraft.descripcion}
                      onChange={(e) =>
                        setEditDraft({
                          ...editDraft,
                          descripcion: e.target.value,
                        })
                      }
                      className="border border-orange-200 rounded-lg px-3 py-2 w-full"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() =>
                          update.mutate({ id: c.id, payload: editDraft })
                        }
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-2 rounded-lg inline-flex items-center justify-center gap-1.5"
                      >
                        <Check size={16} /> Guardar
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg inline-flex items-center justify-center gap-1.5"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-amber-900">
                          {c.nombre}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            c.activa
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {c.activa ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                      {c.descripcion && (
                        <p className="text-sm text-amber-900/70 mt-1 break-words">
                          {c.descripcion}
                        </p>
                      )}
                      <p className="text-xs text-amber-900/50 mt-1">
                        ID #{c.id}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => startEdit(c)}
                        className="bg-orange-100 hover:bg-orange-200 text-orange-700 p-2 rounded-lg"
                        title="Editar"
                        aria-label="Editar categoría"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmCat(c)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg"
                        title="Desactivar"
                        aria-label="Desactivar categoría"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!confirmCat}
        title="Desactivar categoría"
        message={
          confirmCat
            ? `La categoría "${confirmCat.nombre}" dejará de mostrarse en la carta. Podrás volver a activarla editándola. ¿Continuar?`
            : ""
        }
        confirmLabel="Sí, desactivar"
        cancelLabel="Cancelar"
        tone="danger"
        loading={remove.isPending}
        onCancel={() => setConfirmCat(null)}
        onConfirm={() => {
          if (!confirmCat) return;
          const id = confirmCat.id;
          remove.mutate(id, {
            onSettled: () => setConfirmCat(null),
          });
        }}
      />
    </div>
  );
};

export default AdminCategories;
