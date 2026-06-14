export type Visibility = "secret" | "private" | "public";

export type RawCard = {
  type: string,
  rarity: string,
  name: string,
  power: number,
  health: number,
  cost: number,
  color_cost: Array<string>,
  description: string,
  tags: Array<string>,
  colors: Array<string>,
  art_url: string,
  card_picture_url: string,
  nature: string,
  back_side_url: string,
}

export type Card = {
  raw: RawCard | undefined,
  type: string | undefined,
  rarity: string | undefined,
  name: string | undefined,
  power: number | undefined,
  health: number | undefined,
  cost: number | undefined,
  color_cost: Array<string> | undefined,
  description: string | undefined,
  comments: string,
  tags: Array<string> | undefined,
  colors: Array<string> | undefined,
  visibility: Visibility,
  tapped: boolean,
  owner: number,
  art_url: string | undefined,
  card_picture_url: string | undefined,
  nature: string,
  visible_to_me: boolean,
  back_side_url: string,
  cardId: number,
}

export type FightArea = {
  sides: Array<Pile>,
}

export type PlayerArea = Record<string, Pile>;

export function newPlayerArea(): PlayerArea {
  return {
    heroes: newPile(false, "public"),
    hand: newPile(false, "private"),
    main_deck: newPile(true, "secret"),
    mana_deck: newPile(true, "secret"),
    additional_deck: newPile(true, "secret"),
    mana_pool: newPile(false, "public"),
    trash_deck: newPile(false, "public"),
    special_zone: newPile(false, "public"),
    base: newPile(false, "public"),
  }
}

export function newFightArea(playersCount: number): FightArea {
  let sides = new Array(playersCount + 1);
  for (let i of sides.keys()) {
    sides[i] = newPile();
  }
  return {
    sides,
  }
}

export type CardPointer = {
  pile: PilePointer,
  index: number,
}

export type ChipPointer = {
  board: BoardPointer,
  index: number,
}

export type PileType = { battlefield: number } | { name: String };

export type PilePointer = {
  player: number,
  type: PileType,
}

export type BoardPointer = {
  name: string,
}

export type Pile = {
  cards: Array<Card>,
  only_raw_cards: boolean,
  default_visibility: Visibility,
}

export function newPile(only_raw_cards: boolean = false, visibility: Visibility = "secret"): Pile {
  return {
    cards: [],
    only_raw_cards, default_visibility: visibility,
  }
}

export function newBoard(): Board {
  return {
    raw: {
      height: 100,
      width: 150,
      img_url: "",
    },
    img_url: "",
    chips: [] as Array<Chip>
  }
}

export function newCard(): Card {
  return {
    cardId: Math.random(),
    raw: undefined,
    type: undefined,
    rarity: undefined,
    name: undefined,
    power: undefined,
    health: undefined,
    cost: undefined,
    color_cost: undefined,
    description: undefined,
    comments: "",
    tags: undefined,
    colors: undefined,
    tapped: false,
    visibility: "secret",
    owner: 0,
    art_url: undefined,
    card_picture_url: undefined,
    nature: "",
    visible_to_me: false,
    back_side_url: "",
  }
}

export type Coordinates = {
  x: number,
  y: number,
}

export type RawChip = {
  health: number,
  art_url: string,
  name: string,
  colors: Array<string>,
}

export type Chip = {
  raw: RawChip | undefined,
  health: number | undefined,
  coordinates: Coordinates,
  owner: number,
  chipId: number,
}

export type RawBoard = {
  height: number,
  width: number,
  img_url: string,
}

export type Board = {
  raw: RawBoard,
  img_url: string,
  chips: Array<Chip>,
}

export function getColor(strs: Array<string>): string {
  let colors = [];
  for (let str of strs) {
    switch (str) {
      case "*":
      case "rage":
      case "red":
      case "noxus":
        colors.push("#a62828");
        break;
      case "%":
      case "defence":
      case "orange":
      case "piltover&zaun":
        colors.push("#9e5315");
        break;
      case "!":
      case "proud":
      case "yellow":
      case "shurima":
        colors.push("#8f892c");
        break;
      case "&":
      case "calm":
      case "green":
        colors.push("#348236");
        break;
      case "~":
      case "wisdom":
      case "blue":
      case "bildgewater":
        colors.push("#254773");
        break;
      case "@":
      case "chaos":
      case "purple":
      case "abyss":
        colors.push("#480d5c");
        break;
      default:
        colors.push(str);
        break;
    }
  }
  if (colors.length <= 1) {
    return colors[0] ?? "#000000";
  } else {
    return `linear-gradient(135deg, ${colors.join(', ')})`;
  }
}
