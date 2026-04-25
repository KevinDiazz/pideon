import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "../services/ordersService";

/**
 * Configuración estándar para queries de pedidos: polling corto + refresca
 * al volver a la pestaña + siempre stale para que invalidate refresque ya.
 *
 * `placeholderData: (prev) => prev` mantiene visible la última respuesta
 * mientras se refetchea, así no se parpadea a "0" o a skeleton al remontar
 * el componente (p.ej. al volver de / → redirect → /repartidor).
 */
export const pedidoQueryOptions = {
  refetchInterval: 5_000,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  staleTime: 0,
  placeholderData: (prev) => prev,
};

/**
 * Actualiza el estado de un pedido con update optimista. Revierte si falla.
 *
 * Usar:
 *   const mut = useUpdateEstado();
 *   mut.mutate({ id, estado: "listo" });
 */
export const useUpdateEstado = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }) => ordersService.updateEstado(id, estado),

    onMutate: async ({ id, estado }) => {
      // Cancelar refetches en curso para no pisar el update optimista
      await qc.cancelQueries({ queryKey: ["pedidos"] });

      // Snapshot de todos los caches tocados (para rollback)
      const prev = qc.getQueriesData({ queryKey: ["pedidos"] });

      // Aplicar el cambio optimista a CADA cache de pedidos.
      // Bumpeamos también `updated_at` para que las colas ordenadas por
      // este campo (p.ej. la de "en preparación" en cocina) coloquen el
      // pedido al final inmediatamente, sin esperar al refetch.
      const nowIso = new Date().toISOString();
      qc.setQueriesData({ queryKey: ["pedidos"] }, (old) => {
        if (Array.isArray(old)) {
          return old.map((p) =>
            p.id === id ? { ...p, estado, updated_at: nowIso } : p
          );
        }
        // Caches de detalle por id (useQueries en Repartidor): objeto único
        if (old && typeof old === "object" && old.id === id) {
          return { ...old, estado, updated_at: nowIso };
        }
        return old;
      });

      return { prev };
    },

    onError: (_err, _vars, context) => {
      // Rollback
      if (context?.prev) {
        for (const [key, value] of context.prev) {
          qc.setQueryData(key, value);
        }
      }
    },

    onSettled: () => {
      // Sincronizar con servidor al final (éxito o error)
      qc.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
};

/**
 * Auto-asignación de repartidor con update optimista.
 */
export const useAsignarRepartidor = (userId) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => ordersService.autoAsignar(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["pedidos"] });
      const prev = qc.getQueriesData({ queryKey: ["pedidos"] });

      qc.setQueriesData({ queryKey: ["pedidos"] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((p) =>
          p.id === id
            ? {
                ...p,
                asignacion_reparto: [
                  ...(p.asignacion_reparto || []),
                  { repartidor_id: userId, pedido_id: id, _optimistic: true },
                ],
              }
            : p
        );
      });

      return { prev };
    },

    onError: (_err, _vars, context) => {
      if (context?.prev) {
        for (const [key, value] of context.prev) {
          qc.setQueryData(key, value);
        }
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
};
