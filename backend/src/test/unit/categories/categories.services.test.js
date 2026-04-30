import * as categoriaRepository from "../../../modules/categories/categories.repository.js";
import {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "../../../modules/categories/categories.service.js";

jest.mock("../../../modules/categories/categories.repository.js");
describe("getCategorias", () => {
  test("devuelve todas las categorías", async () => {
    categoriaRepository.findAll.mockResolvedValue([
      { id: 1, nombre: "Bebidas" },
    ]);

    const result = await getCategorias();

    expect(result).toHaveLength(1);
    expect(categoriaRepository.findAll).toHaveBeenCalled();
  });
});
describe("getCategoriaById", () => {
  test("devuelve una categoría", async () => {
    categoriaRepository.findById.mockResolvedValue({
      id: 1,
      nombre: "Bebidas",
    });

    const result = await getCategoriaById(1);

    expect(result.id).toBe(1);
    expect(categoriaRepository.findById).toHaveBeenCalledWith(1);
  });
});
describe("createCategoria", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("crea categoría si no existe", async () => {
    categoriaRepository.findByNombre.mockResolvedValue(null);

    categoriaRepository.create.mockResolvedValue({
      id: 1,
      nombre: "Bebidas",
    });

    const result = await createCategoria({ nombre: "Bebidas" });

    expect(categoriaRepository.findByNombre).toHaveBeenCalledWith("Bebidas");

    expect(categoriaRepository.create).toHaveBeenCalled();

    expect(result.nombre).toBe("Bebidas");
  });

  test("lanza error si ya existe", async () => {
    categoriaRepository.findByNombre.mockResolvedValue({
      id: 1,
    });

    await expect(createCategoria({ nombre: "Bebidas" })).rejects.toMatchObject({
      message: "Ya existe una categoría con ese nombre",
      statusCode: 400,
    });
  });
});
describe("updateCategoria", () => {
  test("actualiza categoría", async () => {
    categoriaRepository.update.mockResolvedValue({
      id: 1,
      nombre: "Comida",
    });

    const result = await updateCategoria(1, { nombre: "Comida" });

    expect(categoriaRepository.update).toHaveBeenCalledWith(1, {
      nombre: "Comida",
    });

    expect(result.nombre).toBe("Comida");
  });
});
describe("deleteCategoria", () => {
  test("elimina (soft delete)", async () => {
    categoriaRepository.softDelete.mockResolvedValue(true);

    const result = await deleteCategoria(1);

    expect(categoriaRepository.softDelete).toHaveBeenCalledWith(1);

    expect(result).toBe(true);
  });
});
