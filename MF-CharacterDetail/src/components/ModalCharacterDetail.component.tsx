import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    useDisclosure,
    Spinner,
    Chip,
} from "@nextui-org/react";
import {
    CalendarDays,
    CircleDot,
    Info,
    MapPin,
    MonitorPlay,
    UserRound,
    X,
} from "lucide-react";
import { motion } from "framer-motion";
import {
    CharacterDetail,
    EpisodeDetail,
} from "../models/specific/IRickAndMortyDetail";
import {
    getCharacterDetail,
    getEpisodesByUrls,
} from "../services/ServicioRickAndMortyDetail.service";

interface ModalCharacterDetailProps {
    characterId: number;
    triggerText?: string;
    triggerVariant?:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
    triggerClassName?: string;
    buttonFullWidth?: boolean;
}

const formatGender = (gender: string): string => {
    switch (gender.toLowerCase()) {
        case "male":
            return "Masculino";
        case "female":
            return "Femenino";
        case "genderless":
            return "Sin género";
        default:
            return "Desconocido";
    }
};

const formatCharacterStatus = (status: CharacterDetail["status"]) => {
    switch (status) {
        case "Alive":
            return {
                label: "Vivo",
                chipClassName:
                    "border border-green-500/30 bg-green-500/10 text-green-400",
                dotClassName: "bg-green-400",
            };
        case "Dead":
            return {
                label: "Muerto",
                chipClassName: "border border-red-500/30 bg-red-500/10 text-red-400",
                dotClassName: "bg-red-400",
            };
        default:
            return {
                label: "Desconocido",
                chipClassName: "border border-sky-500/30 bg-sky-500/10 text-sky-400",
                dotClassName: "bg-sky-400",
            };
    }
};

const formatCreatedDate = (value: string): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
};

type InfoItemProps = {
    icon: React.ReactNode;
    label: string;
    value: string;
};

function InfoItem({ icon, label, value }: InfoItemProps) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/70">
                {icon}
                <span>{label}</span>
            </div>
            <p className="text-sm font-semibold text-white sm:text-base">{value}</p>
        </div>
    );
}

type EpisodeCardProps = {
    episode: EpisodeDetail;
};

function EpisodeCard({ episode }: EpisodeCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-cyan-500/20 bg-[#041922] px-4 py-4 shadow-[0_0_0_1px_rgba(34,211,238,0.03)]"
        >
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold tracking-wide text-green-400">
                        {episode.episode}
                    </span>
                    <span className="text-base font-semibold text-white">
                        {episode.name}
                    </span>
                </div>

                <p className="text-sm text-cyan-100/60">{episode.air_date}</p>
            </div>
        </motion.div>
    );
}

export default function ModalCharacterDetail({
    characterId,
    triggerText = "Ver detalle",
    triggerVariant = "bordered",
    triggerClassName = "",
    buttonFullWidth = true,
}: ModalCharacterDetailProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [character, setCharacter] = useState<CharacterDetail | null>(null);
    const [episodes, setEpisodes] = useState<EpisodeDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const statusMeta = useMemo(
        () =>
            character
                ? formatCharacterStatus(character.status)
                : {
                    label: "",
                    chipClassName: "",
                    dotClassName: "",
                },
        [character],
    );

    const loadCharacterDetail = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const characterData = await getCharacterDetail(characterId);
            setCharacter(characterData);

            const episodesData = await getEpisodesByUrls(characterData.episode);
            setEpisodes(episodesData);
        } catch (err) {
            setCharacter(null);
            setEpisodes([]);
            setError(
                err instanceof Error
                    ? err.message
                    : "Ocurrió un error al obtener el detalle del personaje.",
            );
        } finally {
            setLoading(false);
        }
    }, [characterId]);

    useEffect(() => {
        if (isOpen) {
            loadCharacterDetail();
        }
    }, [isOpen, loadCharacterDetail]);

    return (
        <>
            <Button
                variant={triggerVariant}
                onPress={onOpen}
                fullWidth={buttonFullWidth}
                startContent={<Info size={16} />}
                className={`border border-emerald-500/25 bg-transparent text-white hover:border-emerald-400/40 hover:bg-emerald-500/10 ${triggerClassName}`}
            >
                {triggerText}
            </Button>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="5xl"
                hideCloseButton
                scrollBehavior="inside"
                classNames={{
                    base: "bg-transparent shadow-none",
                    backdrop: "bg-slate-950/70 backdrop-blur-sm",
                    wrapper: "px-2 sm:px-6",
                }}
            >
                <ModalContent className="overflow-hidden rounded-[28px] border border-cyan-500/20 bg-[#02131a] text-white shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
                    {(onClose) => (
                        <ModalBody className="p-0">
                            {loading ? (
                                <div className="flex min-h-[520px] items-center justify-center">
                                    <Spinner
                                        size="lg"
                                        label="Cargando detalle del personaje..."
                                    />
                                </div>
                            ) : error ? (
                                <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 px-6 text-center">
                                    <div className="rounded-full border border-red-500/20 bg-red-500/10 p-4">
                                        <Info className="text-red-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">
                                        No fue posible cargar el detalle
                                    </h3>
                                    <p className="max-w-xl text-sm text-white/70">{error}</p>
                                    <div className="flex gap-3">
                                        <Button variant="light" onPress={onClose}>
                                            Cerrar
                                        </Button>
                                        <Button
                                            color="primary"
                                            onPress={loadCharacterDetail}
                                            className="bg-cyan-500 font-semibold text-slate-950"
                                        >
                                            Reintentar
                                        </Button>
                                    </div>
                                </div>
                            ) : !character ? (
                                <div className="flex min-h-[420px] items-center justify-center px-6 text-center text-white/70">
                                    No se encontró información del personaje.
                                </div>
                            ) : (
                                <div className="flex max-h-[85vh] flex-col">
                                    <div className="relative border-b border-cyan-500/15">
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            radius="full"
                                            onPress={onClose}
                                            className="absolute right-4 top-4 z-20 border border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
                                        >
                                            <X size={18} />
                                        </Button>

                                        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
                                            <div className="relative min-h-[280px] overflow-hidden border-b border-cyan-500/15 lg:min-h-full lg:border-b-0 lg:border-r">
                                                <img
                                                    src={character.image}
                                                    alt={character.name}
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#02131a]/60 via-transparent to-transparent" />
                                            </div>

                                            <div className="px-6 py-6 sm:px-8 sm:py-8">
                                                <div className="mb-5 flex items-center justify-between gap-4">
                                                    <Chip
                                                        radius="full"
                                                        className={`px-3 ${statusMeta.chipClassName}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`h-2.5 w-2.5 rounded-full ${statusMeta.dotClassName}`}
                                                            />
                                                            <span className="font-semibold">
                                                                {statusMeta.label}
                                                            </span>
                                                        </div>
                                                    </Chip>
                                                </div>

                                                <h2 className="text-3xl font-bold tracking-tight text-white">
                                                    {character.name}
                                                </h2>

                                                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                    <InfoItem
                                                        icon={<CircleDot size={13} />}
                                                        label="Especie"
                                                        value={character.species || "Desconocida"}
                                                    />

                                                    <InfoItem
                                                        icon={<UserRound size={13} />}
                                                        label="Género"
                                                        value={formatGender(character.gender)}
                                                    />

                                                    <InfoItem
                                                        icon={<MapPin size={13} />}
                                                        label="Origen"
                                                        value={character.origin?.name || "Desconocido"}
                                                    />

                                                    <InfoItem
                                                        icon={<MapPin size={13} />}
                                                        label="Ubicación"
                                                        value={character.location?.name || "Desconocida"}
                                                    />

                                                    <InfoItem
                                                        icon={<CalendarDays size={13} />}
                                                        label="Registrado"
                                                        value={formatCreatedDate(character.created)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="min-h-0 flex-1 px-6 py-6 sm:px-8">
                                        <div className="mb-5 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <MonitorPlay size={18} className="text-green-400" />
                                                <h3 className="text-xl font-bold tracking-wide text-white">
                                                    EPISODIOS
                                                </h3>
                                            </div>

                                            <p className="text-sm text-cyan-200/70">
                                                {episodes.length} episodios
                                            </p>
                                        </div>

                                        {episodes.length === 0 ? (
                                            <div className="rounded-2xl border border-cyan-500/15 bg-[#041922] px-5 py-10 text-center text-white/70">
                                                Este personaje no tiene episodios asociados.
                                            </div>
                                        ) : (
                                            <div className="max-h-[340px] overflow-y-auto pr-2">
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    {episodes.map((episode) => (
                                                        <EpisodeCard key={episode.id} episode={episode} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </ModalBody>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}