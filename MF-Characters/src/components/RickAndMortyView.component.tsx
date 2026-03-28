import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Input,
  Card,
  CardBody,
  Chip,
  Spinner,
  Pagination,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { Search, Filter, UserRound, Dna, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { CharacterItem } from "../models/specific/IRickAndMortyView";
import {
  getCharacters,
  mapUiStatusToApiStatus,
  UiFilterStatus,
} from "../services/ServicioRickAndMorty.service";
import {
  formatGender,
  getFilterButtonClass,
  getStatusChipProps,
  statusOptions,
} from "../utils/rickAndMorty.utils";
import ModalCharacterDetail from "./ModalCharacterDetail.component";
const Ejemplo = React.lazy(() => import("CharacterDetail/Ejemplo"));

export default function RickAndMortyView() {
  const [characters, setCharacters] = useState<CharacterItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UiFilterStatus>("Todos");
  const [page, setPage] = useState(1);

  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("");

  const [totalCharacters, setTotalCharacters] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiStatus = useMemo(() => mapUiStatusToApiStatus(status), [status]);

  const fetchCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCharacters({
        page,
        name: search,
        status: apiStatus,
      });

      setCharacters(data.results ?? []);
      setTotalCharacters(data.info?.count ?? 0);
      setTotalPages(data.info?.pages ?? 1);
    } catch (err) {
      setCharacters([]);
      setTotalCharacters(0);
      setTotalPages(1);
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al consultar la API.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, apiStatus]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const speciesOptions = useMemo(() => {
    const uniqueSpecies = Array.from(
      new Set(
        characters
          .map((character) => character.species?.trim())
          .filter(Boolean) as string[],
      ),
    );

    return uniqueSpecies.sort((a, b) => a.localeCompare(b));
  }, [characters]);

  const originOptions = useMemo(() => {
    const uniqueOrigins = Array.from(
      new Set(
        characters
          .map((character) => character.origin?.name?.trim())
          .filter(Boolean) as string[],
      ),
    );

    return uniqueOrigins.sort((a, b) => a.localeCompare(b));
  }, [characters]);

  const filteredCharacters = useMemo(() => {
    return characters.filter((character) => {
      const matchesSpecies = selectedSpecies
        ? character.species === selectedSpecies
        : true;

      const matchesOrigin = selectedOrigin
        ? character.origin?.name === selectedOrigin
        : true;

      return matchesSpecies && matchesOrigin;
    });
  }, [characters, selectedSpecies, selectedOrigin]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    setSelectedSpecies("");
    setSelectedOrigin("");
  };

  const handleStatusChange = (value: UiFilterStatus) => {
    setStatus(value);
    setPage(1);
    setSelectedSpecies("");
    setSelectedOrigin("");
  };

  return (
    <section className="min-h-screen w-full bg-[#02131a] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            <span className="text-[#00e05a]">Rick & Morty</span> — Personajes
          </h1>

          <p className="mt-2 text-lg text-cyan-100/70">
            {selectedSpecies || selectedOrigin
              ? `${filteredCharacters.length} personajes filtrados en esta página`
              : `${totalCharacters} personajes encontrados`}
          </p>
        </div>

        <Ejemplo />

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-cyan-500/15 bg-[#031b23] px-4 py-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="w-full">
              <Input
                value={search}
                onValueChange={handleSearchChange}
                size="lg"
                radius="lg"
                placeholder="Buscar personaje..."
                startContent={<Search size={20} className="text-cyan-200/50" />}
                classNames={{
                  inputWrapper:
                    "bg-[#032733] border border-cyan-500/20 shadow-none hover:border-cyan-400/30 data-[focus=true]:border-cyan-400/40",
                  input: "text-base text-white placeholder:text-cyan-100/40",
                }}
              />
            </div>

            <div className="w-full">
              <Autocomplete
                selectedKey={selectedSpecies || null}
                onSelectionChange={(key) => setSelectedSpecies(String(key ?? ""))}
                defaultItems={speciesOptions.map((item) => ({
                  key: item,
                  label: item,
                }))}
                size="lg"
                radius="lg"
                placeholder="Filtrar por especie"
                startContent={<Dna size={18} className="text-cyan-200/50" />}
                inputValue={selectedSpecies}
                onInputChange={(value) => {
                  if (!value) {
                    setSelectedSpecies("");
                  }
                }}
                classNames={{
                  base: "w-full",
                  selectorButton: "text-cyan-200/50",
                  popoverContent:
                    "bg-[#031b23] border border-cyan-500/20 text-white",
                }}
                inputProps={{
                  classNames: {
                    inputWrapper:
                      "bg-[#032733] border border-cyan-500/20 shadow-none hover:border-cyan-400/30 data-[focus=true]:border-cyan-400/40",
                    input: "text-white placeholder:text-cyan-100/40",
                  },
                }}
              >
                {(item) => (
                  <AutocompleteItem
                    key={item.key}
                    className="text-white data-[hover=true]:bg-cyan-500/10"
                  >
                    {item.label}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>

            <div className="w-full">
              <Autocomplete
                selectedKey={selectedOrigin || null}
                onSelectionChange={(key) => setSelectedOrigin(String(key ?? ""))}
                defaultItems={originOptions.map((item) => ({
                  key: item,
                  label: item,
                }))}
                size="lg"
                radius="lg"
                placeholder="Filtrar por origen"
                startContent={<MapPin size={18} className="text-cyan-200/50" />}
                inputValue={selectedOrigin}
                onInputChange={(value) => {
                  if (!value) {
                    setSelectedOrigin("");
                  }
                }}
                classNames={{
                  base: "w-full",
                  selectorButton: "text-cyan-200/50",
                  popoverContent:
                    "bg-[#031b23] border border-cyan-500/20 text-white",
                }}
                inputProps={{
                  classNames: {
                    inputWrapper:
                      "bg-[#032733] border border-cyan-500/20 shadow-none hover:border-cyan-400/30 data-[focus=true]:border-cyan-400/40",
                    input: "text-white placeholder:text-cyan-100/40",
                  },
                }}
              >
                {(item) => (
                  <AutocompleteItem
                    key={item.key}
                    className="text-white data-[hover=true]:bg-cyan-500/10"
                  >
                    {item.label}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex items-center gap-2 text-cyan-100/70">
              <Filter size={18} />
              <span className="text-lg">Estado:</span>
            </div>

            {statusOptions.map((item) => {
              const isActive = status === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleStatusChange(item)}
                  className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] ${getFilterButtonClass(
                    item,
                    isActive,
                  )}`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Spinner size="lg" label="Cargando personajes..." />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div className="rounded-2xl border border-cyan-500/15 bg-[#031b23] p-10 text-center">
            <p className="text-lg font-semibold text-white">
              No se encontraron personajes
            </p>
            <p className="mt-2 text-cyan-100/60">
              Intenta con otro nombre, cambia el estado o ajusta especie y
              origen.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {filteredCharacters.map((character) => {
                const badge = getStatusChipProps(character.status);

                return (
                  <motion.div
                    key={character.id}
                    className="h-full"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <Card
                      shadow="sm"
                      radius="lg"
                      className="h-full overflow-hidden border border-cyan-500/20 bg-[#021a22] transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
                    >
                      <div className="relative overflow-hidden">
                        <motion.img
                          src={character.image}
                          alt={character.name}
                          className="h-[340px] w-full object-cover"
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                        />

                        <div className="absolute right-4 top-4">
                          <Chip
                            radius="full"
                            className={`px-2 ${badge.className}`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${badge.dotClassName}`}
                              />
                              <span>{badge.label}</span>
                            </div>
                          </Chip>
                        </div>
                      </div>

                      <CardBody className="space-y-4 bg-[#02131a] px-5 py-5">
                        <h2 className="text-2xl font-bold text-white">
                          {character.name}
                        </h2>

                        <div className="space-y-3 text-sm">
                          <div className="flex items-start justify-between gap-4">
                            <span className="min-w-[90px] uppercase tracking-widest text-cyan-100/60">
                              Especie
                            </span>
                            <span className="text-right text-xl font-medium text-white">
                              {character.species || "Desconocida"}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-4">
                            <span className="min-w-[90px] uppercase tracking-widest text-cyan-100/60">
                              Género
                            </span>

                            <span className="flex items-center gap-2 text-right text-xl font-medium text-white">
                              <UserRound size={16} className="text-cyan-100/50" />
                              {formatGender(character.gender)}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-4">
                            <span className="min-w-[90px] uppercase tracking-widest text-cyan-100/60">
                              Origen
                            </span>
                            <span className="max-w-[180px] text-right text-base font-medium text-white">
                              {character.origin?.name || "Desconocido"}
                            </span>
                          </div>
                        </div>

                        <ModalCharacterDetail
                          characterId={character.id}
                          triggerText="Ver detalle"
                        />
                      </CardBody>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <Pagination
                total={totalPages}
                page={page}
                onChange={setPage}
                showControls
                radius="full"
                color="success"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}