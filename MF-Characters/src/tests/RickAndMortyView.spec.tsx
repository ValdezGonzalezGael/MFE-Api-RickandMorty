import { Suspense } from "react";
import {
    render,
    screen,
    waitFor,
    fireEvent,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import RickAndMortyView from "../components/RickAndMortyView.component";
import {
    getCharacters,
    mapUiStatusToApiStatus,
} from "../services/ServicioRickAndMorty.service";

jest.mock("../services/ServicioRickAndMorty.service", () => ({
    getCharacters: jest.fn(),
    mapUiStatusToApiStatus: jest.fn(),
}));

jest.mock("../utils/rickAndMorty.utils", () => ({
    formatGender: jest.fn((gender: string) => {
        switch (gender?.toLowerCase()) {
            case "male":
                return "Masculino";
            case "female":
                return "Femenino";
            default:
                return "Desconocido";
        }
    }),
    getFilterButtonClass: jest.fn(() => "mock-filter-class"),
    getStatusChipProps: jest.fn((status: string) => ({
        label: status,
        className: "mock-chip-class",
        dotClassName: "mock-dot-class",
    })),
    statusOptions: ["Todos", "Vivo", "Muerto", "Desconocido"],
}));

jest.mock("framer-motion", () => ({
    motion: {
        div: ({
            children,
            initial,
            animate,
            exit,
            whileHover,
            whileTap,
            transition,
            variants,
            ...props
        }: any) => <div {...props}>{children}</div>,

        img: ({
            children,
            initial,
            animate,
            exit,
            whileHover,
            whileTap,
            transition,
            variants,
            ...props
        }: any) => <img {...props}>{children}</img>,
    },
}));

jest.mock(
    "CharacterDetail/ModalCharacterDetail",
    () => ({
        __esModule: true,
        default: ({ characterId, triggerText }: any) => (
            <button data-testid={`modal-detail-${characterId}`}>
                {triggerText} - {characterId}
            </button>
        ),
    }),
    { virtual: true },
);

jest.mock("@nextui-org/react", () => {
    const React = require("react");

    const Input = ({
        value,
        onValueChange,
        placeholder,
        startContent,
        classNames,
        radius,
        size,
        fullWidth,
        variant,
        color,
        isClearable,
        isDisabled,
        isReadOnly,
        ...props
    }: any) => (
        <div>
            {startContent}
            <input
                value={value}
                placeholder={placeholder}
                onChange={(e) => onValueChange?.(e.target.value)}
                {...props}
            />
        </div>
    );

    const Card = ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
    );

    const CardBody = ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
    );

    const Chip = ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
    );

    const Spinner = ({ label }: any) => <div>{label}</div>;

    const Pagination = ({ total, page, onChange }: any) => (
        <div>
            <span data-testid="pagination">
                Página {page} de {total}
            </span>
            <button onClick={() => onChange?.(2)}>Ir página 2</button>
        </div>
    );

    const Autocomplete = ({
        placeholder,
        selectedKey,
        onSelectionChange,
        defaultItems = [],
        inputValue,
        onInputChange,
        children,
    }: any) => (
        <div>
            <label>{placeholder}</label>
            <select
                data-testid={`autocomplete-${placeholder}`}
                value={selectedKey ?? ""}
                onChange={(e) => onSelectionChange?.(e.target.value || null)}
            >
                <option value="">Seleccione</option>
                {defaultItems.map((item: any) => (
                    <option key={item.key} value={item.key}>
                        {item.label}
                    </option>
                ))}
            </select>

            <input
                data-testid={`autocomplete-input-${placeholder}`}
                value={inputValue ?? ""}
                onChange={(e) => onInputChange?.(e.target.value)}
            />

            <div>
                {defaultItems.map((item: any) =>
                    children ? React.cloneElement(children(item), { key: item.key }) : null,
                )}
            </div>
        </div>
    );

    const AutocompleteItem = ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
    );

    return {
        Input,
        Card,
        CardBody,
        Chip,
        Spinner,
        Pagination,
        Autocomplete,
        AutocompleteItem,
    };
});

describe("RickAndMortyView", () => {
    const mockedGetCharacters = getCharacters as jest.Mock;
    const mockedMapUiStatusToApiStatus = mapUiStatusToApiStatus as jest.Mock;

    const mockResponse = {
        info: {
            count: 3,
            pages: 2,
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
            {
                id: 3,
                name: "Birdperson",
                status: "Dead",
                species: "Bird-Person",
                gender: "Male",
                origin: { name: "Bird World" },
                image: "birdperson.jpg",
            },
        ],
    };

    const renderComponent = () =>
        render(
            <Suspense fallback={<div>Loading lazy...</div>}>
                <RickAndMortyView />
            </Suspense>,
        );

    beforeEach(() => {
        jest.clearAllMocks();

        mockedMapUiStatusToApiStatus.mockImplementation((status) => {
            switch (status) {
                case "Vivo":
                    return "alive";
                case "Muerto":
                    return "dead";
                case "Desconocido":
                    return "unknown";
                default:
                    return undefined;
            }
        });
    });

    it("debe renderizar el título principal", async () => {
        mockedGetCharacters.mockResolvedValue(mockResponse);

        renderComponent();

        expect(
            screen.getByRole("heading", { name: /rick & morty.*personajes/i }),
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(mockedGetCharacters).toHaveBeenCalled();
        });
    });

    it("debe consultar personajes al montar el componente", async () => {
        mockedGetCharacters.mockResolvedValue(mockResponse);

        renderComponent();

        await waitFor(() => {
            expect(mockedGetCharacters).toHaveBeenCalledWith({
                page: 1,
                name: "",
                status: undefined,
            });
        });
    });

    it("debe mostrar spinner mientras carga", () => {
        mockedGetCharacters.mockImplementation(() => new Promise(() => { }));

        renderComponent();

        expect(screen.getByText(/cargando personajes/i)).toBeInTheDocument();
    });

    it("debe renderizar personajes cuando la consulta es exitosa", async () => {
        mockedGetCharacters.mockResolvedValue(mockResponse);

        renderComponent();

        expect(await screen.findByText("Rick Sanchez")).toBeInTheDocument();
        expect(screen.getByText("Morty Smith")).toBeInTheDocument();
        expect(screen.getByText("Birdperson")).toBeInTheDocument();
        expect(screen.getByText(/3 personajes encontrados/i)).toBeInTheDocument();
    });

    it("debe renderizar el modal de detalle por cada personaje", async () => {
        mockedGetCharacters.mockResolvedValue(mockResponse);

        renderComponent();

        expect(await screen.findByTestId("modal-detail-1")).toBeInTheDocument();
        expect(screen.getByTestId("modal-detail-2")).toBeInTheDocument();
        expect(screen.getByTestId("modal-detail-3")).toBeInTheDocument();
    });

    it("debe mostrar error cuando falla la consulta", async () => {
        mockedGetCharacters.mockRejectedValue(
            new Error("Error al consultar personajes"),
        );

        renderComponent();

        expect(
            await screen.findByText("Error al consultar personajes"),
        ).toBeInTheDocument();
    });

    it("debe mostrar mensaje genérico cuando falla con un error no controlado", async () => {
        mockedGetCharacters.mockRejectedValue("error raro");

        renderComponent();

        expect(
            await screen.findByText(/ocurrió un error al consultar la api/i),
        ).toBeInTheDocument();
    });

    it("debe mostrar estado vacío cuando no hay personajes", async () => {
        mockedGetCharacters.mockResolvedValue({
            info: { count: 0, pages: 1 },
            results: [],
        });

        renderComponent();

        expect(
            await screen.findByText(/no se encontraron personajes/i),
        ).toBeInTheDocument();
    });

    it("debe buscar personajes al escribir en el input y reiniciar a página 1", async () => {
        mockedGetCharacters.mockResolvedValue(mockResponse);

        renderComponent();

        await screen.findByText("Rick Sanchez");

        const input = screen.getByPlaceholderText(/buscar personaje/i);
        fireEvent.change(input, { target: { value: "Rick" } });

        await waitFor(() => {
            expect(mockedGetCharacters).toHaveBeenLastCalledWith({
                page: 1,
                name: "Rick",
                status: undefined,
            });
        });
    });

    it("debe cambiar estado y volver a consultar", async () => {
        mockedGetCharacters.mockResolvedValue(mockResponse);

        renderComponent();

        await screen.findByText("Rick Sanchez");

        fireEvent.click(screen.getByRole("button", { name: "Muerto" }));

        await waitFor(() => {
            expect(mockedMapUiStatusToApiStatus).toHaveBeenCalledWith("Muerto");
            expect(mockedGetCharacters).toHaveBeenLastCalledWith({
                page: 1,
                name: "",
                status: "dead",
            });
        });
    });

    it("debe filtrar por especie", async () => {
        mockedGetCharacters.mockResolvedValue(mockResponse);

        renderComponent();

        await screen.findByText("Rick Sanchez");

        const speciesSelect = screen.getByTestId(
            "autocomplete-Filtrar por especie",
        );

        fireEvent.change(speciesSelect, {
            target: { value: "Bird-Person" },
        });

        expect(screen.getByText("Birdperson")).toBeInTheDocument();
        expect(screen.queryByText("Rick Sanchez")).not.toBeInTheDocument();
        expect(screen.queryByText("Morty Smith")).not.toBeInTheDocument();
        expect(
            screen.getByText(/1 personajes filtrados en esta página/i),
        ).toBeInTheDocument();
    });

    it("debe filtrar por origen", async () => {
        mockedGetCharacters.mockResolvedValue(mockResponse);

        renderComponent();

        await screen.findByText("Rick Sanchez");

        const originSelect = screen.getByTestId("autocomplete-Filtrar por origen");

        fireEvent.change(originSelect, {
            target: { value: "Bird World" },
        });

        expect(screen.getByText("Birdperson")).toBeInTheDocument();
        expect(screen.queryByText("Rick Sanchez")).not.toBeInTheDocument();
        expect(screen.queryByText("Morty Smith")).not.toBeInTheDocument();
    });

    it("debe aplicar ambos filtros: especie y origen", async () => {
        mockedGetCharacters.mockResolvedValue(mockResponse);

        renderComponent();

        await screen.findByText("Rick Sanchez");

        fireEvent.change(screen.getByTestId("autocomplete-Filtrar por especie"), {
            target: { value: "Human" },
        });

        fireEvent.change(screen.getByTestId("autocomplete-Filtrar por origen"), {
            target: { value: "Earth (C-137)" },
        });

        expect(screen.getByText("Rick Sanchez")).toBeInTheDocument();
        expect(screen.queryByText("Morty Smith")).not.toBeInTheDocument();
        expect(screen.queryByText("Birdperson")).not.toBeInTheDocument();
    });

    it("debe mostrar vacío si la combinación de filtros no encuentra coincidencias", async () => {
        mockedGetCharacters.mockResolvedValue(mockResponse);

        renderComponent();

        await screen.findByText("Rick Sanchez");

        fireEvent.change(screen.getByTestId("autocomplete-Filtrar por especie"), {
            target: { value: "Human" },
        });

        fireEvent.change(screen.getByTestId("autocomplete-Filtrar por origen"), {
            target: { value: "Bird World" },
        });

        expect(
            screen.getByText(/no se encontraron personajes/i),
        ).toBeInTheDocument();
    });

    it("debe cambiar de página y volver a consultar", async () => {
        mockedGetCharacters.mockResolvedValue(mockResponse);

        renderComponent();

        await screen.findByText("Rick Sanchez");

        fireEvent.click(screen.getByRole("button", { name: /ir página 2/i }));

        await waitFor(() => {
            expect(mockedGetCharacters).toHaveBeenLastCalledWith({
                page: 2,
                name: "",
                status: undefined,
            });
        });

        expect(screen.getByTestId("pagination")).toHaveTextContent("Página 2 de 2");
    });

    it("debe limpiar filtros locales al cambiar búsqueda", async () => {
        mockedGetCharacters.mockResolvedValue(mockResponse);

        renderComponent();

        await screen.findByText("Rick Sanchez");

        fireEvent.change(screen.getByTestId("autocomplete-Filtrar por especie"), {
            target: { value: "Human" },
        });

        fireEvent.change(screen.getByPlaceholderText(/buscar personaje/i), {
            target: { value: "Morty" },
        });

        await waitFor(() => {
            expect(mockedGetCharacters).toHaveBeenLastCalledWith({
                page: 1,
                name: "Morty",
                status: undefined,
            });
        });
    });

    it("debe limpiar filtros locales al cambiar estado", async () => {
        mockedGetCharacters.mockResolvedValue(mockResponse);

        renderComponent();

        await screen.findByText("Rick Sanchez");

        fireEvent.change(screen.getByTestId("autocomplete-Filtrar por especie"), {
            target: { value: "Human" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Vivo" }));

        await waitFor(() => {
            expect(mockedGetCharacters).toHaveBeenLastCalledWith({
                page: 1,
                name: "",
                status: "alive",
            });
        });
    });

    it("debe renderizar especies y orígenes únicos", async () => {
        mockedGetCharacters.mockResolvedValue(mockResponse);

        renderComponent();

        await screen.findByText("Rick Sanchez");

        const speciesAutocomplete = screen.getByTestId(
            "autocomplete-Filtrar por especie",
        ) as HTMLSelectElement;

        const originAutocomplete = screen.getByTestId(
            "autocomplete-Filtrar por origen",
        ) as HTMLSelectElement;

        expect(speciesAutocomplete).toBeInTheDocument();
        expect(originAutocomplete).toBeInTheDocument();

        const speciesOptions = Array.from(speciesAutocomplete.querySelectorAll("option")).map(
            (option) => option.textContent,
        );

        const originOptions = Array.from(originAutocomplete.querySelectorAll("option")).map(
            (option) => option.textContent,
        );

        expect(speciesOptions).toContain("Human");
        expect(speciesOptions).toContain("Bird-Person");

        expect(originOptions).toContain("Earth (C-137)");
        expect(originOptions).toContain("Bird World");
        expect(originOptions).toContain("Earth (Replacement Dimension)");
    });
});