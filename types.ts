
export interface Skill {
  id: string;
  name: string;
  description: string;
  manaCost?: string;
  origin?: string;
}

export interface Scenario {
  id: string;
  name: string;
  skills: Skill[];
}

export interface CharacterInfo {
  race: string;
  characterClass: string;
  deity: string;
  level: string;
  feature: string;
}
