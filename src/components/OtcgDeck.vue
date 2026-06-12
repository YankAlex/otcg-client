<template>
  <div class="deck-container"
    @dragenter="draggedOver = true"
    @dragover="draggedOver = true"
    @dragleave="draggedOver = false"
    @dragexit="draggedOver = false"
    @mouseleave="focusedCard = -1"
    @drop.prevent="dropEvent"
    @dragenter.prevent
    @dragover.prevent
      :style="draggedOverStyle"
  >
    <span class="deck-name"> {{Object.values(pointer.type)[0]}} </span>
    <div class="deck">
      <TransitionGroup name="deck-group">
      <OtcgCard 
        v-for="(card, index) in deck.cards"
        :card :pointer="{pile: pointer, index}"
        :redactable="redactable"
        @mouseenter="focusedCard = index"
        :style="shift(index, focusedCard, deck, maxShift)"
        :class="attentionClass(card, deck)"
        :size :server :key="card.cardId" :defaultAction/>
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts">
  import { type PropType } from 'vue';
  import { type Card, type CardPointer, type Pile, type PilePointer } from '@/structs.ts';
  import OtcgCard from './OtcgCard.vue';

  export default {
    components: {OtcgCard},
    
    props: {
      defaultAction: {
        type: Function,
      },
      size: {
        type: Number,
        default: 130,
      },
      maxShift: {
        type: Number,
        default: 10,
      },
      pointer: {
        type: Object as PropType<PilePointer>,
        required: true,
      },
      deck: {
        type: Object as PropType<Pile>,
        required: true,
      },
      server: {
        type: WebSocket,
        required: true,
      },
      defaultDropIndex: {
        type: Number,
        default: 0,
      },
      redactable: {
        type: Boolean,
        default: true,
      },
      shift: {
        type: Function,
        default: function (index: number, focusedCard: number, deck: Pile, maxShift: number) {
          let total = deck.cards.length;
          return `top: ${total > 1 ? index * maxShift/ (total - 1) : 0}px;
                  z-index: ${total - index};`;
        }
      },
    },
    data() {
      return {
        draggedOver: false,
        focusedCard: -1,
      }
    },
    computed: {
      attentionClass(): Function {
        return (card: Card, deck: Pile) => {
          if (card.visibility != deck.default_visibility) {
            return 'attention-card';
          } else {
            return '';
          }
        }
      },
      width(): string {
        return this.size + "px";
      },
      borderRadius(): string {
        return this.size * 0.10 + "px";
      },
      height(): string {
        return this.size / 0.75 + "px";
      },
      defaultDropPointer(): CardPointer {
        return {
          index: this.defaultDropIndex,
          pile: this.pointer,
        }
      },
      draggedOverStyle(): string {
        if (this.draggedOver) {
          return `
            border-radius: v-bind(border-radius);
            background-color: #adff2f55;
            outline: greenyellow dashed 5px;
          `;
        }
        return ""
      },
    },
    methods: {
      dropEvent(event: DragEvent) {
        this.draggedOver = false;
        let x = event.dataTransfer?.getData("json/move") ?? "";
        console.log(x);
        this.server.send(JSON.stringify({
          move_card: {
            source: JSON.parse(x),
            destination: this.defaultDropPointer,
          }
        }));
      }
    }
  }
</script>

<style>

.deck-group-enter-active,
.deck-group-leave-active {
  transition: transform 0.3s ease, scale 0.3s ease;
}

.deck-group-enter-from,
.deck-group-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.deck-group-move {
  position: absolute;
  transition: transform 0.3s ease, scale 0.3s ease;
}

.deck {
  height: v-bind(height);
  position: relative;
}

.deck-name {
  user-select: none;
  color: #ddd;
  position: absolute;
  top: 10px;
  left: 3vh;
  font-size: 2vh;
}

.deck-container {
  display: flex;
  position: relative;
  align-items: center;
}

.card-container {
  position: absolute;
}
</style>
