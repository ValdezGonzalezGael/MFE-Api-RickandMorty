import ApiRickAndMorty from "../services/endpointRickAndMorty.service";

describe("endpointRickAndMorty.service", () => {
  it("debe exportar el objeto ApiRickAndMorty", () => {
    expect(ApiRickAndMorty).toBeDefined();
    expect(typeof ApiRickAndMorty).toBe("object");
  });

  it("debe contener la propiedad character", () => {
    expect(ApiRickAndMorty).toHaveProperty("character");
  });

  it("debe tener la url correcta del endpoint de character", () => {
    expect(ApiRickAndMorty.character).toBe(
      "https://rickandmortyapi.com/api/character",
    );
  });

  it("la propiedad character debe ser un string", () => {
    expect(typeof ApiRickAndMorty.character).toBe("string");
  });

  it("la url de character no debe estar vacía", () => {
    expect(ApiRickAndMorty.character).not.toBe("");
  });

  it("la url de character debe iniciar con https://", () => {
    expect(ApiRickAndMorty.character.startsWith("https://")).toBe(true);
  });
});