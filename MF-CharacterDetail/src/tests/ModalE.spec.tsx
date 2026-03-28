import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ModalE from "../components/Ejemplo";
import { NextUIProvider } from "@nextui-org/react";

describe("ModalE Component", () => {
  const renderWithNextUI = (ui: React.ReactNode) => {
    return render(<NextUIProvider>{ui}</NextUIProvider>);
  };

  test("renders the button to open the modal", () => {
    renderWithNextUI(<ModalE />);
    const openButton = screen.getByText("Open Modal");
    
    expect(openButton).toBeTruthy();
  });

  test("opens and closes the modal", async () => {
    renderWithNextUI(<ModalE />);

    // Obtener botón para abrir modal
    const openButton = screen.getByText("Open Modal");
    fireEvent.click(openButton);

    // Verificar que el modal se abre
    expect(screen.getByText("Modal Title")).toBeTruthy();
    expect(screen.getByText("ESTE ES TU PRIMER MFE")).toBeTruthy();

    // Obtener botón para cerrar modal
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    // Esperar a que el modal desaparezca
    await waitFor(() => {
      expect(screen.queryByText("Modal Title")).toBeNull();
    });
  });
});
