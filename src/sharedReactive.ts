import { reactive } from 'vue'
export const data = reactive({mainPlayer: 1, battlefieldsCount: 0, view_card_pictures: true})
export function setMainPlayer(u: number) { data.mainPlayer = u }
export function getMainPlayer(): number {
  return data.mainPlayer;
}
export function setBattlefieldsCount(u: number) { data.battlefieldsCount = u }
export function getBattlefieldsCount(): number {
  return data.battlefieldsCount;
}
export function toggleViewCardPictures() { data.view_card_pictures = !data.view_card_pictures }
export function getViewCardPictures(): boolean {
  return data.view_card_pictures;
}
