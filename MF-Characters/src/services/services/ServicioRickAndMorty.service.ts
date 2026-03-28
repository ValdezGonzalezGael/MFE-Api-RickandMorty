import { ApiResponse } from "../../models/specific/IRickAndMortyView";
import ApiRickAndMorty from "./endpointRickAndMorty.service";

export type CharacterStatus = "alive" | "dead" | "unknown" | "";
export type UiFilterStatus = "Todos" | "Vivo" | "Muerto" | "Desconocido";

export interface GetCharactersParams {
  page: number;
  name?: string;
  status?: CharacterStatus;
}


export const mapUiStatusToApiStatus = (
  status: UiFilterStatus,
): CharacterStatus => {
  switch (status) {
    case "Vivo":
      return "alive";
    case "Muerto":
      return "dead";
    case "Desconocido":
      return "unknown";
    default:
      return "";
  }
};

export const buildCharactersQueryParams = ({
  page,
  name,
  status,
}: GetCharactersParams): string => {
  const params = new URLSearchParams();

  params.append("page", String(page));

  if (name?.trim()) {
    params.append("name", name.trim());
  }

  if (status) {
    params.append("status", status);
  }

  return params.toString();
};

export const getCharacters = async ({
  page,
  name,
  status,
}: GetCharactersParams): Promise<ApiResponse> => {
  const queryParams = buildCharactersQueryParams({
    page,
    name,
    status,
  });

  const response = await fetch(`${ApiRickAndMorty.character}/?${queryParams}`);

  if (!response.ok) {
    if (response.status === 404) {
      return {
        info: {
          count: 0,
          pages: 1,
          next: null,
          prev: null,
        },
        results: [],
      };
    }

    throw new Error("No fue posible consultar los personajes.");
  }

  const data: ApiResponse = await response.json();
  return data;
};