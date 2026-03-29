import ApiRickAndMorty from "../services/EndpointRickAndMortyDetail.service";

describe("EndpointRickAndMortyDetail.service", () => {
  it("debe exportar el objeto ApiRickAndMorty", () => {
    expect(ApiRickAndMorty).toBeDefined();
    expect(typeof ApiRickAndMorty).toBe("object");
  });

  it("debe contener la propiedad Api", () => {
    expect(ApiRickAndMorty).toHaveProperty("Api");
  });

  it("debe tener la url correcta del api de Rick and Morty", () => {
    expect(ApiRickAndMorty.Api).toBe("https://rickandmortyapi.com/api");
  });

  it("la propiedad Api debe ser un string", () => {
    expect(typeof ApiRickAndMorty.Api).toBe("string");
  });

  it("la url no debe estar vacía", () => {
    expect(ApiRickAndMorty.Api).not.toEqual("");
  });
});