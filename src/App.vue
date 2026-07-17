<script lang="ts">
import OtcgCard from './components/OtcgCard.vue';
import OtcgDeck from './components/OtcgDeck.vue';
import { setBattlefieldsCount, setMainPlayer } from './sharedReactive';
import { newPlayerArea, newFightArea, newPile, type PlayerArea, type Card, type CardPointer, type FightArea, type Pile, type PilePointer, type BoardPointer, newBoard, type Board, type Chip, type ChipPointer } from './structs';
import StandartPlayerSide from './components/StandartPlayerSide.vue';
import SmallPlayerSide from './components/SmallPlayerSide.vue';
import StandartMiddleArea from './components/StandartMiddleArea.vue';
import BoardedMiddleArea from './components/BoardedMiddleArea.vue';

let search = new URLSearchParams(window.location.search);
let invitation_search = new URLSearchParams(window.location.search);
invitation_search.delete("watcher");

export default {
  components: {OtcgDeck, OtcgCard, StandartPlayerSide, SmallPlayerSide, StandartMiddleArea, BoardedMiddleArea},
  data() {
    return {
      //ws: new WebSocket("ws://192.168.1.128:8126/game_queue/ws"),
      ws: new WebSocket(`ws://${search.get('address')}/${search.has('queue') ? "game_queue" : "lobby/" + search.get('lobby')}${search.has('watcher') ? "/watcher" : ""}/ws`),
      // ws: new WebSocket("ws://192.168.1.128:8126/game_queue/ws"),
      gameName: search.get('game') ?? "unmatched",
      invitationURL: encodeURIComponent(window.location.origin + "?" + invitation_search.toString()),
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      player_areas: [] as Array<PlayerArea>,
      battlefields: [] as Array<FightArea>,
      spell_queue: newPile(false, "public"),
      board: newBoard(),
      players_count: 0,
      playerNumber: 1,
      bottomPlayer: 1,
      activePlayer: 0,
      gameStarted: false,
      newPile,
      newPlayerArea,
      cardListShift(index: number, focusedCard: number, deck: Pile, maxShift: number) {
        let scaling = focusedCard != -1;
        if (focusedCard == -1) focusedCard = deck.cards.length;
        let meFocused = focusedCard == index;
        return `left: ${(index + 0.5) * maxShift / (deck.cards.length)}px;
                z-index: ${meFocused ? 1000 : 10 + deck.cards.length - Math.abs(index - focusedCard)};
                scale: ${1 + (scaling ? 0.2 / (Math.abs(index - focusedCard) + 1) : 0)};`;
      },
      spellQueueShift(index: number, focusedCard: number, deck: Pile, maxShift: number) {
        let scaling = focusedCard != -1;
        let meFocused = focusedCard == index;
        return `left: ${deck.cards.length - 1 ? index * maxShift / (deck.cards.length - 1) : 0}px;
                z-index: ${meFocused ? 1000 : 10 + deck.cards.length - Math.abs(index - focusedCard)};
                scale: ${1 + (scaling ? 0.25 / (Math.abs(index - focusedCard) + 1) : 0)};`;
      },
    }
  },
  computed: {
    enemyPlayerArea() {
      if (this.activePlayer != this.playerNumber) {
        return `#331111`;
      } else {
        return `#221111`;
      }
    },
    yourPlayerArea() {
      if (this.activePlayer == this.playerNumber) {
        return `#113311`;
      } else {
        return `#112211`;
      }
    },
    middleSection() {
      if (this.activePlayer == this.playerNumber) {
        return `linear-gradient(#00000000, ${this.yourPlayerArea})`;
      } else {
        return `linear-gradient(${this.enemyPlayerArea}, #00000000)`;
      }
    },
    playerAreaSize() {
      return this.windowWidth; 
    },
    cardSize() {
      return this.windowHeight / 10;
    },
    gapSize() {
      return this.cardSize * 0.2;
    },
    gapWidth() {
      return this.gapSize + "px";
    },
    borderWidth() {
      return this.gapSize / 3 + "px";
    },
    deckPaddingSize() {
      return this.cardSize * 0.1;
    },
    deckPadding() {
      return this.deckPaddingSize + "px";
    },
    deckRadius() {
      return 20 + "px";
    },
  },
  methods: {
    onPile(pilePointer: PilePointer, fun: Function) {
      if (Object.hasOwn(pilePointer.type, "name")) {
        // @ts-ignore
        if (pilePointer.type.name == "spell_queue") {
          return fun(this.spell_queue);
        } else if (Object.hasOwn(this.player_areas, pilePointer.player - 1)) {
          // @ts-ignore
          if (Object.hasOwn(this.player_areas[pilePointer.player - 1], pilePointer.type.name)) {
            // @ts-ignore
            return fun(this.player_areas[pilePointer.player - 1][pilePointer.type.name]);
          } else {
            // @ts-ignore
            this.player_areas[pilePointer.player - 1][pilePointer.type.name] = newPile(false, "secret");
            // @ts-ignore
            return fun(this.player_areas[pilePointer.player - 1][pilePointer.type.name]);
          }
        }
      } else if (Object.hasOwn(pilePointer.type, "battlefield")) {
        // @ts-ignore
        if (Object.hasOwn(this.battlefields[pilePointer.type.battlefield].sides, pilePointer.player)) {
          // @ts-ignore
          return fun(this.battlefields[pilePointer.type.battlefield]?.sides[pilePointer.player]);
        }
      }
    },
    updatePile(pilePointer: PilePointer, pile: Pile) {
      this.onPile(pilePointer, (prevPile: Pile) => {
        for (const key in prevPile) {
          // @ts-ignore
          delete prevPile[key];
        }
        Object.assign(prevPile, pile)
      });
    },
    updateBoard(boardPointer: BoardPointer, board: Board) {
      this.board = board;
    },
    onChip(chipPointer: ChipPointer, fun: Function) {
      return fun(this.board.chips[chipPointer.index]);
    },
    onCard(cardPointer: CardPointer, fun: Function) {
      return this.onPile(cardPointer.pile, (pile: Pile) => {return fun(pile.cards[cardPointer.index])});
    },
    updateChip(chipPointer: ChipPointer, chip: Chip) {
      this.onChip(chipPointer, (prevChip: Chip) => {
        for (const key in prevChip) {
          if (key != 'chipId') {
            // @ts-ignore
            delete prevChip[key];
          }
        }
        Object.assign(prevChip, chip)
      });
    },
    updateCard(cardPointer: CardPointer, card: Card) {
      this.onCard(cardPointer, (prevCard: Card) => {
        for (const key in prevCard) {
          if (key != 'cardId') {
            // @ts-ignore
            delete prevCard[key];
          }
        }
        Object.assign(prevCard, card)
      });
    },
    reloadGame() {
      this.ws.send('"game_info"');
    },
    goInQueue() {
      this.ws.onmessage = (message) => {
        if (message.data == '"background_request"') {
          this.ws.send(prompt("Which background play?") ?? "{}")
          return;
        }
        if (message.data == '"choose_player"') {
          this.ws.send(prompt("Choose player (1, 2 ...)?") ?? "{}")
          return;
        }
        let data = JSON.parse(message.data);
        if (Object.hasOwn(data, "game_info")) {
          this.gameStarted = true;
          this.players_count = data.game_info.players_count;
          this.playerNumber = data.game_info.your_number;
          setMainPlayer(this.playerNumber);
          this.bottomPlayer = this.playerNumber <= 0 ? 1 : this.playerNumber;
          this.player_areas = new Array(data.game_info.players_count)
          for (let i of this.player_areas.keys()) {
            this.player_areas[i] = newPlayerArea();
          }
          this.battlefields = new Array(data.game_info.battlefields_count);
          setBattlefieldsCount(data.game_info.battlefields_count);
          for (let i of this.battlefields.keys()) {
            this.battlefields[i] = newFightArea(data.game_info.players_count);
          }
          if (this.gameName == "unmatched") {
            for (let i = 1; i <= data.game_info.players_count; i++) {
              this.requestPile({player: i, type: { name: "main_deck"}});
              this.requestPile({player: i, type: { name: "additional_deck"}});
              this.requestPile({player: i, type: { name: "trash_deck"}});
              this.requestPile({player: i, type: { name: "hand"}});
              this.requestPile({player: i, type: { name: "heroes"}});
            }
            this.requestBoard({name: "board"});
          } else {
            for (let i = 1; i <= data.game_info.players_count; i++) {
              this.requestPile({player: i, type: { name: "main_deck"}});
              this.requestPile({player: i, type: { name: "mana_deck"}});
              this.requestPile({player: i, type: { name: "mana_pool"}});
              this.requestPile({player: i, type: { name: "trash_deck"}});
              this.requestPile({player: i, type: { name: "base"}});
              this.requestPile({player: i, type: { name: "hand"}});
              this.requestPile({player: i, type: { name: "heroes"}});
              this.requestPile({player: i, type: { name: "special_zone"}});
            }
            this.requestPile({player: 0, type: { name: "spell_queue"}});
          }
          for (let i = 0; i <= data.game_info.players_count; i++) {
            for (let j = 0; j < data.game_info.battlefields_count; j++) {
              this.requestPile({
                player: i,
                type: {
                  battlefield: j
                }
              });
            }
          }
        }
        if (Object.hasOwn(data, "view_pile")) {
          let action = data.view_pile;
          for (let i of action.pile.cards) {
            i.cardId = Math.random();
          }
          this.updatePile(action.target, action.pile);
        }
        if (Object.hasOwn(data, "view_board")) {
          let action = data.view_board;
          for (let i of action.board.chips) {
            i.chipId = Math.random();
          }
          this.updateBoard(action.target, action.board);
        }
        if (Object.hasOwn(data, "chip_changed")) {
          let action = data.chip_changed;
          this.updateChip(action.target, action.new_chip);
        }
        if (Object.hasOwn(data, "board_changed")) {
          let action = data.board_changed;
          this.updateBoard(action.target, action.new_board);
        }
        if (Object.hasOwn(data, "chip_created")) {
          let action = data.chip_created;
          let destination: ChipPointer = action.destination;
          let chip: Chip = action.chip;
          if (destination.index < 0) {
              destination.index = destination.index % (this.board.chips.length + 1) + this.board.chips.length + 1;
          }
          this.board.chips.splice(destination.index, 0, chip);
        }
        if (Object.hasOwn(data, "card_changed")) {
          let action = data.card_changed;
          this.updateCard(action.target, action.new_card);
        }
        if (Object.hasOwn(data, "card_created")) {
          let action = data.card_created;
          let destination: CardPointer = action.destination;
          let card: Card = action.card;
          this.onPile(destination.pile, (pile: Pile) => {
            if (destination.index < 0) {
              destination.index = destination.index % (pile.cards.length + 1) + pile.cards.length + 1;
            }
            pile.cards.splice(destination.index, 0, card);
          });
        }
        if (Object.hasOwn(data, "card_shuffled_to_pile")) {
          console.log(data);
          let action = data.card_shuffled_to_pile;
          let source: CardPointer = action.source;
          let destination: CardPointer = action.destination;
          this.onPile(source.pile, (pile: Pile) => {
            pile.cards.splice(source.index, 1);
          });
          this.ws.send(JSON.stringify({
            "view_pile": destination,
          }))
        }
        if (Object.hasOwn(data, "card_moved")) {
          let action = data.card_moved;
          let source: CardPointer = action.source;
          let destination: CardPointer = action.destination;
          let card: Card = this.onPile(source.pile, (pile: Pile) => {
            let card = pile.cards[source.index];
            pile.cards.splice(source.index, 1);
            return card;
          });
          this.onPile(destination.pile, (pile: Pile) => {
            if (destination.index < 0) {
              destination.index = destination.index % (pile.cards.length + 1) + pile.cards.length + 1;
            }
            pile.cards.splice(destination.index, 0, card);
          });
        }
        if (Object.hasOwn(data, "view_card")) {
          let action = data.view_card;
          this.updateCard(action.target, action.card);
        }
        if (Object.hasOwn(data, "next_turn")) {
          this.activePlayer = data.next_turn;
        }
      }
    },
    requestPile(pile: PilePointer) {
      this.ws.send(JSON.stringify({view_pile: pile}));
    },
    requestBoard(board: BoardPointer) {
      this.ws.send(JSON.stringify({view_board: board}));
    },
    changeVisibility(card: CardPointer) {
      this.ws.send(JSON.stringify({change_card: {target: card, changes: {visibility: "public"}}}));
    },
  },
  mounted() {
    let reloadGame = this.reloadGame;
    let ws = this.ws;
    let me = this;
    window.addEventListener("resize", () => {
      me.windowWidth = window.innerWidth;
      me.windowHeight = window.innerHeight;
    });
    document.addEventListener("keydown", function(event) {
      if (event.key === "r" && event.ctrlKey) {
        event.preventDefault();
        reloadGame();
        console.log("Game reloaded");
      } else if (event.key === "a" && event.ctrlKey) {
        event.preventDefault();
        let name = prompt("Type creating card name");
        if (name != null) {
          ws.send(JSON.stringify({create_card: {name: name, destination: {index: 0, pile: {player: me.playerNumber, type: "base"}}}}));
        }
      }
    })
    this.goInQueue();
  }
}
</script>

<template>
  <div v-if="gameStarted == false" class="qr-code-popup">
    <img class="qr-code" :src="`https://api.qrcode-monkey.com/qr/custom?data=${invitationURL}`">

    </img>
  </div>
  <template v-if="gameName == 'riftbound'">
    <StandartPlayerSide 
      :ws="ws"
      :playerAreaSize
      :player="3 - bottomPlayer"
      :cardSize
      :playerArea="player_areas[2 - bottomPlayer] ?? newPlayerArea()"
      :spellQueueShift
      :cardListShift
      class="enemy-playerArea"
    />
    <StandartMiddleArea
      class="fight-areas"
      :bottomPlayer
      :ws
      :spell_queue
      :activePlayer
      :playerNumber
      :battlefields
      :cardSize
      :cardListShift
      :spellQueueShift
    />
    <StandartPlayerSide 
      :ws
      :playerAreaSize
      :player="bottomPlayer"
      :cardSize
      :playerArea="player_areas[bottomPlayer - 1] ?? newPlayerArea()"
      :spellQueueShift
      :cardListShift
      class="your-playerArea"
    />
  </template>
  <template v-else>
    <SmallPlayerSide 
      :ws="ws"
      :playerAreaSize
      :player="3 - bottomPlayer"
      :cardSize
      :playerArea="player_areas[2 - bottomPlayer] ?? newPlayerArea()"
      :spellQueueShift
      :cardListShift
      class="enemy-playerArea"
    />
    <BoardedMiddleArea
      class="fight-areas"
      :bottomPlayer
      :ws
      :activePlayer
      :playerNumber
      :battlefields
      :cardSize
      :cardListShift
      :spellQueueShift
      :board
    />
    <SmallPlayerSide 
      :ws
      :playerAreaSize
      :player="bottomPlayer"
      :cardSize
      :playerArea="player_areas[bottomPlayer - 1] ?? newPlayerArea()"
      :spellQueueShift
      :cardListShift
      class="your-playerArea"
    />
  </template>
</template>

<style scoped>

.fight-areas {
  position: relative;
  transition: background ease 0.5s;
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: space-around;
  background: v-bind(middleSection);
}

.enemy-playerArea {
  background: v-bind(enemyPlayerArea);
  padding: v-bind(gapWidth);
  display: flex;
  flex-direction: column-reverse;
}

.your-playerArea {
  background: v-bind(yourPlayerArea);
  padding: v-bind(gapWidth);
}

.qr-code {
  height: 100%;
  aspect-ratio: 1;
  border-radius: v-bind(deckRadius);
}

.qr-code-popup {
  position: absolute;
  z-index: 100;
  left: 30vw;
  right: 30vw;
  top: 30vh;
  bottom: 30vh;
  backdrop-filter: blur(3vh);
  border-radius: v-bind(deckRadius);
  box-shadow: #00000099 0px 0px 10vh;
}

@font-face {
  font-family: 'Radley';   /* Name of the font */
  src: url('./assets/Radley-Regular.ttf');   /* Link to access your downloaded fonts */
}

@font-face {
  font-family: 'FiraCode';   /* Name of the font */
  src: url('./assets/FiraCode.ttf');   /* Link to access your downloaded fonts */
}

@font-face {
  font-family: 'ArchivoNarrow';   /* Name of the font */
  src: url('./assets/ArchivoNarrow-Regular.otf');   /* Link to access your downloaded fonts */
}

@font-face {
  font-family: 'LeagueGothic';   /* Name of the font */
  src: url('./assets/LeagueGothic-Regular.otf');   /* Link to access your downloaded fonts */
}

@font-face {
  font-family: 'RobotoCondensed';   /* Name of the font */
  src: url('./assets/RobotoCondensed-Regular.ttf');   /* Link to access your downloaded fonts */
}

</style>
