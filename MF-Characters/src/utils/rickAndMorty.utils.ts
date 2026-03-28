import { CharacterItem } from "../models/specific/IRickAndMortyView";
import { UiFilterStatus } from "../services/services/ServicioRickAndMorty.service";

export const statusOptions: UiFilterStatus[] = [
  "Todos",
  "Vivo",
  "Muerto",
  "Desconocido",
];

export const getStatusChipProps = (status: CharacterItem["status"]) => {
  switch (status) {
    case "Alive":
      return {
        label: "Vivo",
        className:
          "bg-green-100 text-green-600 border border-green-200 font-semibold",
        dotClassName: "bg-green-500",
      };

    case "Dead":
      return {
        label: "Muerto",
        className:
          "bg-red-100 text-red-600 border border-red-200 font-semibold",
        dotClassName: "bg-red-500",
      };

    default:
      return {
        label: "Desconocido",
        className:
          "bg-sky-100 text-sky-600 border border-sky-200 font-semibold",
        dotClassName: "bg-sky-500",
      };
  }
};

export const formatGender = (gender: string): string => {
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

export const getFilterButtonClass = (
  item: UiFilterStatus,
  isActive: boolean,
): string => {
  const styleMap: Record<UiFilterStatus, string> = {
    Todos: isActive
      ? "bg-zinc-900 text-white border-zinc-900"
      : "bg-white text-zinc-700 border-zinc-300",
    Vivo: isActive
      ? "bg-green-100 text-green-700 border-green-400"
      : "bg-white text-green-600 border-green-300",
    Muerto: isActive
      ? "bg-red-100 text-red-700 border-red-400"
      : "bg-white text-red-500 border-red-300",
    Desconocido: isActive
      ? "bg-sky-100 text-sky-700 border-sky-400"
      : "bg-white text-sky-600 border-sky-300",
  };

  return styleMap[item];
};