<template>
  <div class="card-container" :style="cardContainerStyle"
      @click="(event: MouseEvent) => {
        if (event.shiftKey) {
          zoomedCard = !zoomedCard;
        } else if (event.ctrlKey) {
          if (card.visibility != 'public') {
            setMyVisibility('public');
          } else {
            setMyVisibility('secret');
          }
        } else {
          defaultAction(server, card, pointer);
        }
      }"
       >
    <Teleport v-if="zoomedCard" to="body">
      <OtcgCardView class="zoomed-card-view" :size="zoomHeight()" @click="zoomedCard = false" :card/>
      <span class="close-zoom-span" @click="zoomedCard = false"> Click to close </span>
      <div v-if="redactable" class="changes-panel"> 
        <div class="changes-column">
          <input class="changes-button" v-model="commentsChanges"/>
          <button class="changes-button" @click="applyComments"> <code> Apply </code> </button>
          <button class="changes-button" @click="changeToRaw"> <code> Raw </code> </button>
          <div style="width: 100%">
            <button class="changes-button" style="width: 50%" @click="changePower(1)"> <code> P++ </code> </button>
            <button class="changes-button" style="width: 50%" @click="changeHealth(1)"> <code> H++ </code> </button>
          </div>
          <div style="width: 100%">
            <button class="changes-button" style="width: 50%" @click="changePower(-1)"> <code> P-- </code> </button>
            <button class="changes-button" style="width: 50%" @click="changeHealth(-1)"> <code> H-- </code> </button>
          </div>
          <button
            class="tap-button changes-button"
            @click.stop="tapMe(); hideContextMenu()"
          > <code> # </code> </button>
          <button
            class="visibility-button secret changes-button"
            @click.stop="setMyVisibility('secret'); hideContextMenu()"
            :style="visibilityButtonColor('secret')"
          > <code> secret </code> </button>
          <button
            class="visibility-button private changes-button"
            @click.stop="setMyVisibility('private'); hideContextMenu()"
            :style="visibilityButtonColor('private')"
          > <code> private </code> </button>
          <button
            class="visibility-button public changes-button"
            @click.stop="setMyVisibility('public'); hideContextMenu()"
            :style="visibilityButtonColor('public')"
          > <code> public 
          </code> </button>
        </div>
        <div class="changes-column">
          <button class="changes-button" 
              @click.stop="moveMeTo({index: 0, pile: {player: mainPlayer, type: {name: 'hand'}}})"
          > <code> to hand </code> </button>
          <button class="changes-button" 
              @click.stop="moveMeTo({index: 0, pile: {player: mainPlayer, type: {name: 'main_deck'}}})"
          > <code> to main deck </code> </button>
          <button class="changes-button" 
              @click.stop="shuffleMeTo({player: mainPlayer, type: {name: 'main_deck'}})"
          > <code> shuffle to main deck </code> </button>
          <button class="changes-button" 
              @click.stop="moveMeTo({index: -1, pile: {player: mainPlayer, type: {name: 'mana_deck'}}})"
          > <code> to mana deck </code> </button>
          <button class="changes-button" 
              @click.stop="moveMeTo({index: 0, pile: {player: mainPlayer, type: {name: 'mana_pool'}}})"
          > <code> to mana pool </code> </button>
          <button class="changes-button" 
              @click.stop="moveMeTo({index: 0, pile: {player: mainPlayer, type: {name: 'base'}}})"
          > <code> to base </code> </button>
          <button class="changes-button" 
              @click.stop="moveMeTo({index: 0, pile: {player: mainPlayer, type: {name: 'spell_queue'}}})"
          > <code> play </code> </button>
          <button class="changes-button" 
              @click.stop="moveMeTo({index: 0, pile: {player: mainPlayer, type: {name: 'trash_deck'}}})"
          > <code> discard </code> </button>
          <button v-for="(item, i) in new Array(battlefieldsCount)" class="changes-button"
              @click.stop="moveMeTo({index: 0, pile: {player: mainPlayer, type: {battlefield: i}}})"
          > <code> to {{i + 1}} battlefield </code> </button>
          <button v-for="(item, i) in new Array(battlefieldsCount)" class="changes-button"
              @click.stop="moveMeTo({index: 0, pile: {player: 0, type: {battlefield: i}}})"
          > <code> to {{i + 1}} area </code> </button>
          <button class="changes-button" 
              @click.stop="moveMeTo({index: 0, pile: {player: 3 - mainPlayer, type: {name: 'base'}}})"
          > <code> to enemy base </code> </button>
        </div>
      </div>
    </Teleport>
    <div class="card"
      :style="draggedStyle"
      :draggable="redactable"
      @contextmenu.prevent="showContextMenu"
      @dragstart="dragStart"
      @dragend="dragged=false"
    >
      <div class="context-menu" v-if="contextMenuShowed" @blur="hideContextMenu" @click.stop="hideContextMenu"> 
        <button
          class="context-button cancel-button"
          @click.stop="hideContextMenu"
        > <code> X </code> </button>
        <button
          class="context-button tap-button"
          @click.stop="tapMe(); hideContextMenu()"
        > <code> # </code> </button>
        <button
          class="context-button visibility-button secret"
          @click.stop="setMyVisibility('secret'); hideContextMenu()"
          :style="visibilityButtonColor('secret')"
        > <code> {{`secret`}} </code> </button>
        <button
          class="context-button visibility-button private"
          @click.stop="setMyVisibility('private'); hideContextMenu()"
          :style="visibilityButtonColor('private')"
        > <code> {{`private`}} </code> </button>
        <button
          class="context-button visibility-button public"
          @click.stop="setMyVisibility('public'); hideContextMenu()"
          :style="visibilityButtonColor('public')"
        > <code> {{`public`}} </code> </button>
        <button
          class="context-button visibility-button public"
          @click.stop="zoomedCard = !zoomedCard; hideContextMenu()"
          :style="zoomButtonColor"
        > <code> zoom </code> </button>
      </div>
      <OtcgCardView :card :size/>
    </div>
  </div>
</template>

<script lang="ts">
  import type { PropType } from 'vue';
  import { getColor, type Card, type CardPointer, type PilePointer } from '@/structs.ts';
  import OtcgCardView from './OtcgCardView.vue';
  import { getBattlefieldsCount, getMainPlayer } from '@/sharedReactive.ts'

  export default {
    components: { OtcgCardView },
    props: {
      size: {
        type: Number,
        default: 200,
      },
      pointer: {
        type: Object as PropType<CardPointer>,
        default: {
          index: 0,
          pile: {
            type: 'hand',
            player: 1,
          },
        },
      },
      card: {
        type: Object as PropType<Card>,
        required: true,
      },
      server: {
        type: WebSocket,
      },
      redactable: {
        type: Boolean,
        default: true,
      },
      defaultAction: {
        type: Function,
        default: function(server: WebSocket, card: Card, pointer: CardPointer) {
          server.send(JSON.stringify({
            change_card: {
              target: pointer,
              changes: {
                tapped: !card.tapped
              }
            }
          }));
        },
      },
    },
    data() {
      return {
        mainPlayer: getMainPlayer(),
        battlefieldsCount: getBattlefieldsCount(),
        bgrColorLighter: "#36302c",
        bgrColorDarker: "#151312",
        hintColor: "#777777",
        shadow: "black 0px 0px 10px",
        contextMenuShowed: false,
        dragged: false,
        zoomedCard: false,
        commentsChanges: "",
      }
    },
    mounted() {
      this.commentsChanges = this.card.comments;
    },
    computed: {
      cardContainerStyle() {
        return `
          ${this.card.tapped ? 'background: #ffffff44;' : ''}
          ${this.dragged ? 'outline: #ffffff dashed 5px;' : ''}      
        `;
      },
      rotation() {
        return this.card.tapped ? 'rotate(90deg)' : 'rotate(0deg)';
      },
      width() {
        return this.size + "px";
      },
      borderWidth() {
        return (this.size / 20) + "px";
      },
      smallPadding() {
        return (this.size / 40) + "px";
      },
      tooSmallPadding() {
        return (this.size / 80) + "px";
      },
      borderRadius() {
        return (this.size * 0.10) + "px";
      },
      innerRadius() {
        return (Math.max(0, this.size * 0.10 - this.size / 20)) + "px"
      },
      contextButtonFont() {
        return (this.size * 0.15) + "px"
      },
      accentBackground() {
        let colors = this.card.colors ?? [];
        if (colors.length == 0) return this.bgrColorDarker;
        return getColor(colors);
      },
      draggedStyle() {
        if (this.dragged) {
          return `
            opacity: 0.8;
          `
        } else {
          return ``;
        }
      },
      visibilityButtonColor() {
        return (visibility: string) => {
          if (visibility == this.card.visibility) {
            return `background: ${this.accentBackground}; color: white;`;
          }
          return '';
        }
      },
      borderColor() {
        switch (this.card.visibility) {
          case 'secret':
            return 'black';
          case 'private':
            return 'grey';
          case 'public':
            return 'lightgrey';
        }
      },
      cursor() {
        if (this.dragged) {
          return 'none';
        } else {
          return 'default';
        }
      },
      zoomButtonColor() {
        if (this.zoomedCard) {
          return `background: ${this.accentBackground}`;
        } else {
          return '';
        }
      },
      attentionIconLR() {
        return (this.size * 0.38) + "px";
      },
      attentionIconTop() {
        return (-this.size * 0.05) + "px";
      }
    },
    methods: {
      moveMeTo(targetPointer: CardPointer) {
        this.server?.send(JSON.stringify({
          move_card: {
            source: this.pointer,
            destination: targetPointer,
          }
        }));
      },
      shuffleMeTo(targetPointer: PilePointer) {
        this.server?.send(JSON.stringify({
          shuffle_card_to_pile: {
            source: this.pointer,
            destination: targetPointer,
          }
        }));
      },
      zoomHeight() {
        return window.innerHeight * 2.7 / 4 ;
      },
      changeHealth(d: number) {
        this.server?.send(JSON.stringify({change_card: {target: this.pointer, changes: {health: (this.card.health ?? 0) + d}}}));
      },
      changePower(d: number) {
        this.server?.send(JSON.stringify({change_card: {target: this.pointer, changes: {power: (this.card.power ?? 0) + d}}}));
      },
      changeToRaw() {
        this.server?.send(JSON.stringify({change_card_to_raw: {target: this.pointer}}));
      },
      applyComments() {
        this.server?.send(JSON.stringify({change_card: {target: this.pointer, changes: { comments: this.commentsChanges }}}));
      },
      dragStart(event: DragEvent) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
              
        if ('ontouchstart' in window) {
          event.preventDefault();
          return false;
        }       

        this.dragged = true;
        event.dataTransfer?.setData("json/move", JSON.stringify(this.pointer));
      },
      hideContextMenu() {
        this.contextMenuShowed = false;
      },
      showContextMenu() {
        console.log(this.size);
        if (this.size < 100) {
          this.zoomedCard = true;
        } else if (this.redactable) {
          this.contextMenuShowed = true;
        }
      },
      tapMe() {
        this.server?.send(JSON.stringify({
          change_card: {
            target: this.pointer,
            changes: {
              tapped: !this.card.tapped,
            }
          }
        }));
      },
      setMyVisibility(visibility: string) {
        this.server?.send(JSON.stringify({
          change_card: {
            target: this.pointer,
            changes: {
              visibility: visibility,
            }
          }
        }));
      },
    }
  }
</script>

<style>

.attention-card::before {
  content: '\1f441';
  position: absolute;
  z-index: 1;
  font-size: v-bind(contextButtonFont);
  text-align: center;
  border-radius: v-bind(borderRadius);
  background: v-bind(accentBackground);
  color: white;
  font-size: 1vh;
  left: v-bind(attentionIconLR);
  right: v-bind(attentionIconLR);
  top: v-bind(attentionIconTop);
  box-shadow: v-bind(shadow);
}


.zoomed-card-view {
  position: fixed;
  z-index: 1000;
  top: 5vh;
  right: 5vh;
}

.changes-column {
  display: flex;
  flex-direction: column;
  width: 20vh;
}

.changes-panel {
  display: flex;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  padding: 1vh;
  box-shadow: v-bind(shadow);
  border-radius: 10px;
  top: 5vh;
  right: 90vh;
  z-index: 1000;
  position: fixed;
  flex-direction: row;
  width: 53vh;
}

.changes-button {
  font-size: 2vh;
  width: 30vh;
  height: 5vh;
  margin-top: 1vh;
}

.close-zoom-span {
  position: fixed;
  z-index: 10001;
  border-radius: 50px;
  font-size: 50px;
  top: -5vh;
  right: 10vh;
  text-shadow: v-bind(shadow);
}

.card-container {
  width: v-bind(width);
  aspect-ratio: 0.75;
  border-radius: v-bind(borderRadius);
  transition: scale 0.3s ease;
}

/* --- context-menu --- */ 

.context-menu-transition {
  transition: all 0.3s ease ;
}

.context-menu {
  position: absolute;
  z-index: 1000;
  left: v-bind(borderWidth);
  top: v-bind(borderWidth);
  bottom: v-bind(borderWidth);
  right: v-bind(borderWidth);
  padding: v-bind(borderWidth);
  width: auto;
  height: auto;
  border-radius: v-bind(innerRadius);
  line-height: 0;
  backdrop-filter: blur(5vh);
}

.context-button {
  box-shadow: v-bind(shadow);
  background-color: v-bind(bgrColorLighter);
  padding: 0.25vh;
  margin: 0px 0px 0px 0px;
  border-radius: v-bind(contextButtonFont);
  font-size: v-bind(contextButtonFont);
  border: none;
  color: white;
}


.card {
  width: v-bind(width);
  transition: transform 0.5s ease;
  aspect-ratio: 0.75;
  user-select: none;
  transform: v-bind(rotation);
  border-radius: v-bind(borderRadius);
  box-shadow: v-bind(shadow);
  cursor: v-bind(cursor);
}

span {
  font-family: "LeagueGothic";
  color: white;
  cursor: v-bind(cursor);
}

</style>
