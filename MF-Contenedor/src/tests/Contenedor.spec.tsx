import { Suspense } from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Contenedor from "../pages/Contenedor.pages";

jest.mock(
  "Characters/RickAndMortyView",
  () => ({
    __esModule: true,
    default: () => (
      <div data-testid="rick-and-morty-view-mock">
        Mock de RickAndMortyView
      </div>
    ),
  }),
  { virtual: true },
);

describe("Contenedor", () => {
  const renderComponent = async () => {
    await act(async () => {
      render(
        <Suspense fallback={<div>Cargando componente...</div>}>
          <Contenedor />
        </Suspense>,
      );
    });
  };

  it("debe renderizar el contenedor principal", async () => {
    await renderComponent();

    expect(
      await screen.findByTestId("rick-and-morty-view-mock"),
    ).toBeInTheDocument();
  });

  it("debe renderizar el componente lazy RickAndMortyView", async () => {
    await renderComponent();

    expect(
      await screen.findByTestId("rick-and-morty-view-mock"),
    ).toBeInTheDocument();

    expect(screen.getByText("Mock de RickAndMortyView")).toBeInTheDocument();
  });

  it("debe renderizar la firma en pantalla", async () => {
    await renderComponent();

    expect(
      screen.getByText("@Gael Alejandro Valdez González"),
    ).toBeInTheDocument();
  });

  it("debe renderizar tanto el componente mock como la firma", async () => {
    await renderComponent();

    expect(
      await screen.findByTestId("rick-and-morty-view-mock"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("@Gael Alejandro Valdez González"),
    ).toBeInTheDocument();
  });
});