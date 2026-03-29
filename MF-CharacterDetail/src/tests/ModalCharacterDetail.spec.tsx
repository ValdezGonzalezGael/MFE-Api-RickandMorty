import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ModalCharacterDetail from "../components/ModalCharacterDetail.component";
import {
  getCharacterDetail,
  getEpisodesByUrls,
} from "../services/ServicioRickAndMortyDetail.service";

jest.mock("../services/ServicioRickAndMortyDetail.service", () => ({
  getCharacterDetail: jest.fn(),
  getEpisodesByUrls: jest.fn(),
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

jest.mock("@nextui-org/react", () => {
  const React = require("react");

  const Button = ({
    children,
    onPress,
    startContent,
    isIconOnly,
    ...props
  }: any) => (
    <button onClick={onPress} data-icon-only={isIconOnly ? "true" : "false"} {...props}>
      {startContent}
      {children}
    </button>
  );

  const Modal = ({ isOpen, children }: any) => {
    if (!isOpen) return null;
    return <div data-testid="modal">{children}</div>;
  };

  const ModalContent = ({ children, className }: any) => {
    const onClose = jest.fn();
    return (
      <div data-testid="modal-content" className={className}>
        {typeof children === "function" ? children(onClose) : children}
      </div>
    );
  };

  const ModalBody = ({ children, className }: any) => (
    <div data-testid="modal-body" className={className}>
      {children}
    </div>
  );

  const Spinner = ({ label }: any) => (
    <div data-testid="spinner">{label || "Loading..."}</div>
  );

  const Chip = ({ children, className }: any) => (
    <div data-testid="chip" className={className}>
      {children}
    </div>
  );

  const useDisclosure = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return {
      isOpen,
      onOpen: () => setIsOpen(true),
      onOpenChange: (value?: boolean) => {
        if (typeof value === "boolean") {
          setIsOpen(value);
          return;
        }
        setIsOpen((prev: boolean) => !prev);
      },
    };
  };

  return {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    Spinner,
    Chip,
    useDisclosure,
  };
});

describe("ModalCharacterDetail", () => {
  const mockedGetCharacterDetail = getCharacterDetail as jest.Mock;
  const mockedGetEpisodesByUrls = getEpisodesByUrls as jest.Mock;

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe renderizar el botón con el texto por defecto", () => {
    render(<ModalCharacterDetail characterId={1} />);

    expect(screen.getByRole("button", { name: /ver detalle/i })).toBeInTheDocument();
  });

  it("debe renderizar el texto personalizado del botón", () => {
    render(<ModalCharacterDetail characterId={1} triggerText="Abrir detalle" />);

    expect(
      screen.getByRole("button", { name: /abrir detalle/i }),
    ).toBeInTheDocument();
  });

  it("debe abrir el modal y mostrar spinner mientras carga", async () => {
    mockedGetCharacterDetail.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockCharacter), 50);
        }),
    );

    mockedGetEpisodesByUrls.mockResolvedValue(mockEpisodes);

    render(<ModalCharacterDetail characterId={1} />);

    fireEvent.click(screen.getByRole("button", { name: /ver detalle/i }));

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(
      screen.getByText(/cargando detalle del personaje/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedGetCharacterDetail).toHaveBeenCalledWith(1);
    });
  });

  it("debe mostrar el detalle del personaje y episodios cuando la carga es exitosa", async () => {
    mockedGetCharacterDetail.mockResolvedValue(mockCharacter);
    mockedGetEpisodesByUrls.mockResolvedValue(mockEpisodes);

    render(<ModalCharacterDetail characterId={1} />);

    fireEvent.click(screen.getByRole("button", { name: /ver detalle/i }));

    await waitFor(() => {
      expect(mockedGetCharacterDetail).toHaveBeenCalledWith(1);
      expect(mockedGetEpisodesByUrls).toHaveBeenCalledWith(mockCharacter.episode);
    });

    expect(await screen.findByText("Rick Sanchez")).toBeInTheDocument();
    expect(screen.getByText("Vivo")).toBeInTheDocument();
    expect(screen.getByText("Human")).toBeInTheDocument();
    expect(screen.getByText("Masculino")).toBeInTheDocument();
    expect(screen.getByText("Earth (C-137)")).toBeInTheDocument();
    expect(screen.getByText("Citadel of Ricks")).toBeInTheDocument();
    expect(screen.getByText(/2 episodios/i)).toBeInTheDocument();
    expect(screen.getByText("Pilot")).toBeInTheDocument();
    expect(screen.getByText("Lawnmower Dog")).toBeInTheDocument();
    expect(screen.getByText("S01E01")).toBeInTheDocument();
    expect(screen.getByText("S01E02")).toBeInTheDocument();
  });

  it("debe mostrar mensaje cuando no hay episodios asociados", async () => {
    mockedGetCharacterDetail.mockResolvedValue(mockCharacter);
    mockedGetEpisodesByUrls.mockResolvedValue([]);

    render(<ModalCharacterDetail characterId={1} />);

    fireEvent.click(screen.getByRole("button", { name: /ver detalle/i }));

    expect(await screen.findByText("Rick Sanchez")).toBeInTheDocument();
    expect(
      screen.getByText(/este personaje no tiene episodios asociados/i),
    ).toBeInTheDocument();
  });

  it("debe mostrar error cuando falla getCharacterDetail", async () => {
    mockedGetCharacterDetail.mockRejectedValue(
      new Error("Error al obtener personaje"),
    );

    render(<ModalCharacterDetail characterId={1} />);

    fireEvent.click(screen.getByRole("button", { name: /ver detalle/i }));

    expect(
      await screen.findByText(/no fue posible cargar el detalle/i),
    ).toBeInTheDocument();

    expect(screen.getByText("Error al obtener personaje")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reintentar/i }),
    ).toBeInTheDocument();
  });

  it("debe permitir reintentar después de un error", async () => {
    mockedGetCharacterDetail
      .mockRejectedValueOnce(new Error("Fallo inicial"))
      .mockResolvedValueOnce(mockCharacter);

    mockedGetEpisodesByUrls.mockResolvedValue(mockEpisodes);

    render(<ModalCharacterDetail characterId={1} />);

    fireEvent.click(screen.getByRole("button", { name: /ver detalle/i }));

    expect(await screen.findByText("Fallo inicial")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reintentar/i }));

    await waitFor(() => {
      expect(mockedGetCharacterDetail).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText("Rick Sanchez")).toBeInTheDocument();
  });

  it("debe mostrar mensaje genérico cuando el error no es instancia de Error", async () => {
    mockedGetCharacterDetail.mockRejectedValue("error desconocido");

    render(<ModalCharacterDetail characterId={1} />);

    fireEvent.click(screen.getByRole("button", { name: /ver detalle/i }));

    expect(
      await screen.findByText(
        /ocurrió un error al obtener el detalle del personaje/i,
      ),
    ).toBeInTheDocument();
  });

  it("debe mostrar estado muerto cuando el personaje está Dead", async () => {
    mockedGetCharacterDetail.mockResolvedValue({
      ...mockCharacter,
      status: "Dead",
    });
    mockedGetEpisodesByUrls.mockResolvedValue([]);

    render(<ModalCharacterDetail characterId={1} />);

    fireEvent.click(screen.getByRole("button", { name: /ver detalle/i }));

    expect(await screen.findByText("Rick Sanchez")).toBeInTheDocument();
    expect(screen.getByText("Muerto")).toBeInTheDocument();
  });

  it("debe mostrar estado desconocido cuando el status no coincide", async () => {
    mockedGetCharacterDetail.mockResolvedValue({
      ...mockCharacter,
      status: "unknown",
    });
    mockedGetEpisodesByUrls.mockResolvedValue([]);

    render(<ModalCharacterDetail characterId={1} />);

    fireEvent.click(screen.getByRole("button", { name: /ver detalle/i }));

    expect(await screen.findByText("Rick Sanchez")).toBeInTheDocument();
    expect(screen.getByText("Desconocido")).toBeInTheDocument();
  });

  it("debe traducir género female correctamente", async () => {
    mockedGetCharacterDetail.mockResolvedValue({
      ...mockCharacter,
      gender: "Female",
      name: "Summer Smith",
    });
    mockedGetEpisodesByUrls.mockResolvedValue([]);

    render(<ModalCharacterDetail characterId={2} />);

    fireEvent.click(screen.getByRole("button", { name: /ver detalle/i }));

    expect(await screen.findByText("Summer Smith")).toBeInTheDocument();
    expect(screen.getByText("Femenino")).toBeInTheDocument();
  });

  it("debe mostrar fecha no disponible si created es inválida", async () => {
    mockedGetCharacterDetail.mockResolvedValue({
      ...mockCharacter,
      created: "fecha-invalida",
    });
    mockedGetEpisodesByUrls.mockResolvedValue([]);

    render(<ModalCharacterDetail characterId={1} />);

    fireEvent.click(screen.getByRole("button", { name: /ver detalle/i }));

    expect(await screen.findByText("Rick Sanchez")).toBeInTheDocument();
    expect(screen.getByText("Fecha no disponible")).toBeInTheDocument();
  });
});