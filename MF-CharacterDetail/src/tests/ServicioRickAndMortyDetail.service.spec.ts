import { getCharacterDetail, getEpisodesByUrls, } from "../services/ServicioRickAndMortyDetail.service";
import ApiRickAndMorty from "../services/EndpointRickAndMortyDetail.service";

describe("ServicioRickAndMortyDetail.service", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe("getCharacterDetail", () => {
    it("debe obtener el detalle del personaje correctamente", async () => {
      const mockCharacter = {
        id: 1,
        name: "Rick Sanchez",
        status: "Alive",
        species: "Human",
        type: "",
        gender: "Male",
        origin: {
          name: "Earth (C-137)",
          url: "https://rickandmortyapi.com/api/location/1",
        },
        location: {
          name: "Citadel of Ricks",
          url: "https://rickandmortyapi.com/api/location/3",
        },
        image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
        episode: [
          "https://rickandmortyapi.com/api/episode/1",
          "https://rickandmortyapi.com/api/episode/2",
        ],
        url: "https://rickandmortyapi.com/api/character/1",
        created: "2017-11-04T18:48:46.250Z",
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCharacter),
      });

      const result = await getCharacterDetail(1);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${ApiRickAndMorty.Api}/character/1`,
      );
      expect(result).toEqual(mockCharacter);
    });

    it("debe lanzar error si no se puede obtener el detalle del personaje", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      await expect(getCharacterDetail(1)).rejects.toThrow(
        "No fue posible obtener el detalle del personaje.",
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `${ApiRickAndMorty.Api}/character/1`,
      );
    });
  });

  describe("getEpisodesByUrls", () => {
    it("debe obtener múltiples episodios correctamente", async () => {
      const episodeUrls = [
        "https://rickandmortyapi.com/api/episode/1",
        "https://rickandmortyapi.com/api/episode/2",
      ];

      const mockEpisodes = [
        {
          id: 1,
          name: "Pilot",
          air_date: "December 2, 2013",
          episode: "S01E01",
          characters: [],
          url: "https://rickandmortyapi.com/api/episode/1",
          created: "2017-11-10T12:56:33.798Z",
        },
        {
          id: 2,
          name: "Lawnmower Dog",
          air_date: "December 9, 2013",
          episode: "S01E02",
          characters: [],
          url: "https://rickandmortyapi.com/api/episode/2",
          created: "2017-11-10T12:56:33.916Z",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockEpisodes),
      });

      const result = await getEpisodesByUrls(episodeUrls);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${ApiRickAndMorty.Api}/episode/1,2`,
      );
      expect(result).toEqual(mockEpisodes);
    });

    it("debe retornar un arreglo cuando la api responde un solo episodio", async () => {
      const episodeUrls = ["https://rickandmortyapi.com/api/episode/1"];

      const mockEpisode = {
        id: 1,
        name: "Pilot",
        air_date: "December 2, 2013",
        episode: "S01E01",
        characters: [],
        url: "https://rickandmortyapi.com/api/episode/1",
        created: "2017-11-10T12:56:33.798Z",
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockEpisode),
      });

      const result = await getEpisodesByUrls(episodeUrls);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${ApiRickAndMorty.Api}/episode/1`,
      );
      expect(result).toEqual([mockEpisode]);
    });

    it("debe retornar arreglo vacío cuando no hay urls válidas", async () => {
      const episodeUrls = [
        "https://rickandmortyapi.com/api/location/1",
        "https://rickandmortyapi.com/api/character/2",
        "url-invalida",
      ];

      const result = await getEpisodesByUrls(episodeUrls);

      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("debe ignorar urls inválidas y usar solo ids válidos", async () => {
      const episodeUrls = [
        "https://rickandmortyapi.com/api/episode/1",
        "url-invalida",
        "https://rickandmortyapi.com/api/episode/5",
      ];

      const mockEpisodes = [
        {
          id: 1,
          name: "Pilot",
          air_date: "December 2, 2013",
          episode: "S01E01",
          characters: [],
          url: "https://rickandmortyapi.com/api/episode/1",
          created: "2017-11-10T12:56:33.798Z",
        },
        {
          id: 5,
          name: "Meeseeks and Destroy",
          air_date: "January 20, 2014",
          episode: "S01E05",
          characters: [],
          url: "https://rickandmortyapi.com/api/episode/5",
          created: "2017-11-10T12:56:34.022Z",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockEpisodes),
      });

      const result = await getEpisodesByUrls(episodeUrls);

      expect(global.fetch).toHaveBeenCalledWith(
        `${ApiRickAndMorty.Api}/episode/1,5`,
      );
      expect(result).toEqual(mockEpisodes);
    });

    it("debe lanzar error si no se pueden obtener los episodios", async () => {
      const episodeUrls = ["https://rickandmortyapi.com/api/episode/1"];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      await expect(getEpisodesByUrls(episodeUrls)).rejects.toThrow(
        "No fue posible obtener los episodios del personaje.",
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `${ApiRickAndMorty.Api}/episode/1`,
      );
    });
  });
});