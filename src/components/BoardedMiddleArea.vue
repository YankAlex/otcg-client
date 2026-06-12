<template>
  <section>
    <button v-if="activePlayer == playerNumber" class="turn-end-button" @click="nextTurn">
      End turn
    </button>
    <div class="control-column">
      <button class="control-button" @click="createCardDialog"> Create card </button>
      <button class="control-button" @click="createChipDialog"> Create chip</button>
      <button class="control-button" @click="reloadGame"> Reload </button>
    </div>
    <OtcgBoard
      :board
      :boardPointer="{ name: 'board' }"
      :ws
      :heightSize="biggerCardSize * 4 / 3"
    />
    <div class="fight-area" v-for="(battlefield, index) in battlefields">
      <OtcgDeck :pointer="{player: 3 - bottomPlayer, type: {battlefield: index}}"
        class="fight-area-side"
        :size="smallerCardSize"
        :server="ws"
        :redactable=false
        :deck="battlefield.sides[3 - bottomPlayer] ?? newPile()"
        :defaultAction="function() {}"
        :maxShift="battlefieldShift"
        :shift="cardListShift"
      />
      <OtcgDeck :pointer="{player: 0, type: {battlefield: index}}"
        class="fight-area-side"
        :size="smallerCardSize"
        :server="ws"
        :deck="battlefield.sides[0] ?? newPile()"
        :defaultDropIndex=0
        :shift="cardListShift"
        :maxShift="battlefieldShift"
      />
      <OtcgDeck :pointer="{player: bottomPlayer, type: {battlefield: index}}"
        class="fight-area-side"
        :size="smallerCardSize"
        :server="ws"
        :deck="battlefield.sides[bottomPlayer] ?? newPile()"
        :defaultDropIndex=0
        :maxShift="battlefieldShift"
        :shift="cardListShift"
      />
    </div>
  </section>
</template>

<script lang="ts">
  import { newPile, type FightArea, type Board, newBoard } from '@/structs';
  import OtcgCard from './OtcgCard.vue';
  import OtcgDeck from './OtcgDeck.vue';
  import OtcgBoard from './OtcgBoard.vue';
import type { PropType } from 'vue';
  export default {
    components: {OtcgDeck, OtcgCard, OtcgBoard},
    props: {
      bottomPlayer: {
        type: Number,
        required: true,
      },
      ws: {
        type: WebSocket,
        required: true,
      },
      activePlayer: {
        type: Number,
        required: true,
      },
      playerNumber: {
        type: Number,
        required: true,
      },
      battlefields: {
        type: Array<FightArea>,
        required: true,
      },
      cardSize: {
        type: Number,
        required: true,
      },
      cardListShift: {
        type: Function,
        required: true,
      },
      spellQueueShift: {
        type: Function,
        required: true,
      },
      board: {
        type: Object as PropType<Board>,
        required: true,
      },
    },
    data() {
      return {
        newPile,
      }
    },
    computed: {
      smallerCardSize() {
        return this.cardSize * 1.45;
      },
      deckPaddingSize() {
        return this.cardSize * 0.1;
      },
      biggerCardSize() {
        return 3 * this.smallerCardSize;
      },
      battlefieldSize() {
        return this.smallerCardSize * 3 + this.deckPaddingSize * 2;
      },
      spellQueueSize() {
        return this.biggerCardSize + this.deckPaddingSize * 2;
      },
      battlefieldShift() {
        return this.battlefieldSize - this.smallerCardSize - 2 * this.deckPaddingSize;
      },
      battlefieldHeight() {
        return this.smallerCardSize * 4 / 3 + 2 * this.deckPaddingSize / 2 + "px";
      },
      spellQueueHeight() {
        return this.biggerCardSize * 4 / 3 + 2 * this.deckPaddingSize + "px";
      },
      battlefieldWidth() {
        return this.battlefieldSize + "px";
      },
      spellQueueWidth() {
        return this.spellQueueSize + "px";
      },
      deckPadding() {
        return this.deckPaddingSize + "px";
      },
    },
    methods: {
      createChipDialog() {
          let name = prompt("Type creating chip name");
          if (name != null) {
            this.ws.send(JSON.stringify({create_chip: {name: name, coordinates: {x: 0, y: 0}, destination: {index: 0, board: { name: "board" }}}}));
          }
      },
      createCardDialog() {
          let name = prompt("Type creating card name");
          if (name != null) {
            this.ws.send(JSON.stringify({create_card: {name: name, destination: {index: 0, pile: {player: this.playerNumber, type: { name: "hand" }}}}}));
          }
      },
      reloadGame() {
        this.ws.send('"game_info"');
      },
      nextTurn() {
        this.ws.send('"turn_end"');
      },
    },
  }
</script>

<style scoped>

.turn-end-button {
  position: absolute;
  right: 10vh;
  top: v-bind(battlefieldHeight);
  bottom: v-bind(battlefieldHeight);
  width: 20vh;
  border-radius: 60px;
  font-size: 5vh;
  z-index: 1;
  font-family: "LeagueGothic";
  background-color: #181818;
  border: none;
  color: white;
}

.turn-end-button:hover {
  background-color: #203020;
}
.spell-queue {
  width: v-bind(spellQueueWidth);
  height: v-bind(spellQueueHeight);
}

.fight-area {
  width: v-bind(battlefieldWidth);
}

.fight-area-side {
  height: v-bind(battlefieldHeight);
  padding-left: v-bind(deckPadding);
}

.control-button {
  width: 10vh;
  font-size: 2vh;
}

.control-column {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly; 
}
</style>
