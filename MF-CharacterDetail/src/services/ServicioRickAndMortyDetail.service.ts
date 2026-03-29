import {
  CharacterDetail,
  EpisodeDetail,
} from "../models/specific/IRickAndMortyDetail";
import ApiRickAndMorty from "./EndpointRickAndMortyDetail.service";


export const getCharacterDetail = async (
  characterId: number,
): Promise<CharacterDetail> => {
  const response = await fetch(`${ApiRickAndMorty.Api}/character/${characterId}`);

  if (!response.ok) {
    throw new Error("No fue posible obtener el detalle del personaje.");
  }

  const data: CharacterDetail = await response.json();
  return data;
};

const getEpisodeIdsFromUrls = (episodeUrls: string[]): number[] => {
  return episodeUrls
    .map((url) => {
      const match = url.match(/\/episode\/(\d+)$/);
      return match ? Number(match[1]) : null;
    })
    .filter((id): id is number => id !== null);
};

export const getEpisodesByUrls = async (
  episodeUrls: string[],
): Promise<EpisodeDetail[]> => {
  const episodeIds = getEpisodeIdsFromUrls(episodeUrls);

  if (!episodeIds.length) {
    return [];
  }

  const response = await fetch(
    `${ApiRickAndMorty.Api}/episode/${episodeIds.join(",")}`,
  );

  if (!response.ok) {
    throw new Error("No fue posible obtener los episodios del personaje.");
  }

  const data: EpisodeDetail | EpisodeDetail[] = await response.json();

  return Array.isArray(data) ? data : [data];
};