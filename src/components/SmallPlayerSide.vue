<template>
<section>
  <div class="decks-layer">
    <OtcgDeck :pointer="{player: player, type: {name: 'additional_deck'}}"
      class="my-deck"
      :size="cardSize"
      :server="ws"
      :deck="playerArea.additional_deck ?? newPile()"
      :defaultDropIndex=-1
      :defaultAction="function(server: WebSocket, card: Card, pointer: CardPointer) {
        server.send(JSON.stringify({
          change_card: {
            target: pointer,
            changes: {
              visibility: 'public'
            }
          }
        }));
        server.send(JSON.stringify({
          move_card: {
            source: pointer,
            destination: {
              index: 0,
              pile: {
                player: player,
                type: {name: 'hand'},
              }
            }
          }
        }));
      }"
    />
    <OtcgDeck :pointer="{player: player, type: {name: 'main_deck'}}"
      class="my-deck main-deck"
      :size="cardSize"
      :server="ws"
      :deck="playerArea.main_deck ?? newPile()"
      :defaultDropIndex=0
      :defaultAction="function(server: WebSocket, card: Card, pointer: CardPointer) {
        server.send(JSON.stringify({
          change_card: {
            target: pointer,
            changes: {
              visibility: 'private'
            }
          }
        }));
        server.send(JSON.stringify({
          move_card: {
            source: pointer,
            destination: {
              index: 0,
              pile: {
                player: player,
                type: {name: 'hand'},
              }
            }
          }
        }));
      }"
    />
    <OtcgDeck :pointer="{player: player, type: {name: 'hand'}}"
      class="my-deck hand"
      :size="cardSize"
      :server="ws"
      :maxShift="handShift"
      :defaultDropIndex=0
      :shift="cardListShift"
      :deck="playerArea.hand ?? newPile()"
      :defaultAction="function(server: WebSocket, card: Card, pointer: CardPointer) {
        /*
        server.send(JSON.stringify({
          change_card: {
            target: pointer,
            changes: {
              visibility: 'public'
            }
          }
        }));
        server.send(JSON.stringify({
          move_card: {
            source: pointer,
            destination: {
              index: 0,
              pile: {
                player: card.owner,
                type: {name: 'base'},
              }
            }
          }
        }));
        */
      }"
    />
    <span class="player-number-span"> {{player}} </span>
    <OtcgDeck :pointer="{player: player, type: {name: 'heroes'}}"
      class="my-deck heroes"
      :size="cardSize"
      :server="ws"
      :defaultDropIndex=0
      :shift="spellQueueShift"
      :maxShift="30"
      :deck="playerArea.heroes ?? newPile()"
      :defaultAction="function(server: WebSocket, card: Card, pointer: CardPointer) {
        server.send(JSON.stringify({
          change_card: {
            target: pointer,
            changes: {
              tapped: !card.tapped,
            }
          }
        }));
      }"
    />
    <OtcgDeck :pointer="{player: player, type: {name: 'trash_deck'}}"
      class="my-deck trash-deck"
      :size="cardSize"
      :server="ws"
      :defaultDropIndex=0
      :deck="playerArea.trash_deck ?? newPile()"
      :defaultAction="function(server: WebSocket, card: Card, pointer: CardPointer) {}"
    />
  </div>
</section>
</template>

<script lang="ts">
  import type { PropType } from 'vue';
  import { newPile, type Card, type CardPointer } from '@/structs.ts';
  import OtcgDeck from './OtcgDeck.vue';
  import { type PlayerArea } from '@/structs.ts';

  export default {
    components: { OtcgDeck },
    props: {
      ws: {
        type: WebSocket,
        required: true,
      },
      player: {
        type: Number,
        required: true,
      },
      cardSize: {
        type: Number,
        required: true,
      },
      playerArea: {
        type: Object as PropType<PlayerArea>,
        required: true,
      },
      spellQueueShift: {
        type: Function,
        required: true,
      },
      cardListShift: {
        type: Function,
        required: true,
      },
      playerAreaSize: {
        type: Number,
        required: true,
      },
    },
    data() {
      return {
        newPile,
      }
    },
    computed: {
      gapSize() {
        return this.cardSize * 0.2;
      },
      gapWidth() {
        return this.gapSize + "px";
      },
      deckPaddingSize() {
        return this.cardSize * 0.1;
      },
      deckSize() {
        return this.cardSize + 2 * this.deckPaddingSize;
      },
      handSize() {
        return this.playerAreaSize - 6 * this.gapSize - 4 * this.deckSize;
      },
      handShift() {
        return this.handSize - this.cardSize - 2 * this.deckPaddingSize;
      },
      deckHeight() {
        return this.cardSize * 4 / 3 + 2 * this.deckPaddingSize + "px";
      },
      handWidth() {
        return this.handSize + "px";
      },
      deckWidth() {
        return this.deckSize + "px";
      },
      borderWidth() {
        return this.gapSize / 3 + "px";
      },
      deckPadding() {
        return this.deckPaddingSize + "px";
      },
      deckRadius() {
        return 20 + "px";
      },
      playerAreaHeight() {
        return ((this.cardSize * 4 / 3 + 2 * this.deckPaddingSize) + 2 * this.gapSize) + "px"
      },
      playerSpanLeft() {
        return this.deckSize * 2 + this.gapSize * 3 + this.deckPaddingSize + "px";
      },
    }
  }
</script>

<style scoped> 

section {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: v-bind(playerAreaHeight);
}


.decks-layer {
  display: flex;
  justify-content: space-between;
}

.my-deck {
  height: v-bind(deckHeight);
  padding-left: v-bind(deckPadding);
  width: v-bind(deckWidth);
  outline-style: solid;
  outline-color: #eee4;
  outline-width: v-bind(borderWidth);
  border-radius: v-bind(deckRadius);
}

.hand {
  width: v-bind(handWidth);
}

.player-number-span {
  position: absolute;
  font-size: v-bind(deckHeight);
  color: #fff2;
  z-index: 0;
  line-height: v-bind(deckHeight);
  left: v-bind(playerSpanLeft);
}

</style>
