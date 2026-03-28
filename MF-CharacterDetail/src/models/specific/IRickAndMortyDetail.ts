export interface CharacterLocationRef {
  name: string;
  url: string;
}

export interface CharacterDetail {
  id: number;
  name: string;
  status: "Alive" | "Dead" | "unknown";
  species: string;
  type: string;
  gender: string;
  origin: CharacterLocationRef;
  location: CharacterLocationRef;
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface EpisodeDetail {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;
}