import {
  mapUiStatusToApiStatus,
  buildCharactersQueryParams,
  getCharacters,
} from "../services/ServicioRickAndMorty.service";
import ApiRickAndMorty from "../services/endpointRickAndMorty.service";

describe("ServicioRickAndMorty.service", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe("mapUiStatusToApiStatus", () => {
    it("debe retornar 'alive' cuando el estado es 'Vivo'", () => {
      expect(mapUiStatusToApiStatus("Vivo")).toBe("alive");
    });

    it("debe retornar 'dead' cuando el estado es 'Muerto'", () => {
      expect(mapUiStatusToApiStatus("Muerto")).toBe("dead");
    });

    it("debe retornar 'unknown' cuando el estado es 'Desconocido'", () => {
      expect(mapUiStatusToApiStatus("Desconocido")).toBe("unknown");
    });

    it("debe retornar string vacío cuando el estado es 'Todos'", () => {
      expect(mapUiStatusToApiStatus("Todos")).toBe("");
    });
  });

  describe("buildCharactersQueryParams", () => {
    it("debe construir query params solo con page", () => {
      const result = buildCharactersQueryParams({
        page: 1,
      });

      expect(result).toBe("page=1");
    });

    it("debe incluir name cuando viene con valor", () => {
      const result = buildCharactersQueryParams({
        page: 2,
        name: "Rick",
      });

      expect(result).toBe("page=2&name=Rick");
    });

    it("debe hacer trim al name antes de incluirlo", () => {
      const result = buildCharactersQueryParams({
        page: 3,
        name: "   Morty   ",
      });

      expect(result).toBe("page=3&name=Morty");
    });

    it("no debe incluir name cuando viene vacío", () => {
      const result = buildCharactersQueryParams({
        page: 1,
        name: "",
      });

      expect(result).toBe("page=1");
    });

    it("no debe incluir name cuando solo contiene espacios", () => {
      const result = buildCharactersQueryParams({
        page: 1,
        name: "   ",
      });

      expect(result).toBe("page=1");
    });

    it("debe incluir status cuando viene con valor", () => {
      const result = buildCharactersQueryParams({
        page: 1,
        status: "alive",
      });

      expect(result).toBe("page=1&status=alive");
    });

    it("debe incluir name y status cuando ambos existen", () => {
      const result = buildCharactersQueryParams({
        page: 4,
        name: "Summer",
        status: "dead",
      });

      expect(result).toBe("page=4&name=Summer&status=dead");
    });

    it("no debe incluir status cuando viene vacío", () => {
      const result = buildCharactersQueryParams({
        page: 1,
        status: "",
      });

      expect(result).toBe("page=1");
    });
  });

  describe("getCharacters", () => {
    it("debe consultar personajes correctamente solo con page", async () => {
      const mockResponse = {
        info: {
          count: 2,
          pages: 1,
          next: null,
          prev: null,
        },
        results: [
          {
            id: 1,
            name: "Rick Sanchez",
            status: "Alive",
            species: "Human",
            gender: "Male",
            origin: { name: "Earth (C-137)" },
            image: "rick.jpg",
          },
          {
            id: 2,
            name: "Morty Smith",
            status: "Alive",
            species: "Human",
            gender: "Male",
            origin: { name: "Earth (Replacement Dimension)" },
            image: "morty.jpg",
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getCharacters({ page: 1 });

      expect(global.fetch).toHaveBeenCalledWith(
        `${ApiRickAndMorty.character}/?page=1`,
      );
      expect(result).toEqual(mockResponse);
    });

    it("debe consultar personajes con page, name y status", async () => {
      const mockResponse = {
        info: {
          count: 1,
          pages: 1,
          next: null,
          prev: null,
        },
        results: [
          {
            id: 1,
            name: "Rick Sanchez",
            status: "Alive",
            species: "Human",
            gender: "Male",
            origin: { name: "Earth (C-137)" },
            image: "rick.jpg",
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getCharacters({
        page: 2,
        name: "Rick",
        status: "alive",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${ApiRickAndMorty.character}/?page=2&name=Rick&status=alive`,
      );
      expect(result).toEqual(mockResponse);
    });

    it("debe retornar respuesta vacía cuando la API responde 404", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await getCharacters({
        page: 1,
        name: "PersonajeInexistente",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${ApiRickAndMorty.character}/?page=1&name=PersonajeInexistente`,
      );

      expect(result).toEqual({
        info: {
          count: 0,
          pages: 1,
          next: null,
          prev: null,
        },
        results: [],
      });
    });

    it("debe lanzar error cuando la respuesta no es ok y no es 404", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(
        getCharacters({
          page: 1,
          status: "dead",
        }),
      ).rejects.toThrow("No fue posible consultar los personajes.");

      expect(global.fetch).toHaveBeenCalledWith(
        `${ApiRickAndMorty.character}/?page=1&status=dead`,
      );
    });

    it("debe hacer trim al name antes de consultar", async () => {
      const mockResponse = {
        info: {
          count: 1,
          pages: 1,
          next: null,
          prev: null,
        },
        results: [
          {
            id: 3,
            name: "Summer Smith",
            status: "Alive",
            species: "Human",
            gender: "Female",
            origin: { name: "Earth (Replacement Dimension)" },
            image: "summer.jpg",
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getCharacters({
        page: 3,
        name: "   Summer   ",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${ApiRickAndMorty.character}/?page=3&name=Summer`,
      );
      expect(result).toEqual(mockResponse);
    });

    it("no debe incluir status en la url cuando viene vacío", async () => {
      const mockResponse = {
        info: {
          count: 3,
          pages: 1,
          next: null,
          prev: null,
        },
        results: [],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await getCharacters({
        page: 1,
        status: "",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${ApiRickAndMorty.character}/?page=1`,
      );
    });
  });
});