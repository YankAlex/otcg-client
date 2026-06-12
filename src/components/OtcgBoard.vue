<template>
  <div 
    class="board"
    @click.stop="moveChip"
  >
    <img :src="board.img_url" class="board-background-image">
    <OtcgChip
      v-for="(chip, index) in board.chips"
      @click.stop="pickChip(index)"
      :style="'left: ' + ((chip.coordinates.x - halfSize) * sizeCoef) + 'px; top: ' + (chip.coordinates.y - halfSize) * sizeCoef + 'px;' "
      :picked="pickedChipPointer?.index == index"
      :chip
      :ws
    />
  </div>
</template>

<script lang="ts">
  import type { Board, BoardPointer, ChipPointer } from '@/structs';
  import type { PropType } from 'vue';
  import OtcgChip from './OtcgChip.vue';

  export default {
    components: { OtcgChip },
    props: {
      board: {
        type: Object as PropType<Board>,
        required: true,
      },
      boardPointer: {
        type: Object as PropType<BoardPointer>,
        required: true,
      },
      heightSize: {
        type: Number,
        required: true,
      },
      ws: {
        type: WebSocket,
        required: true,
      }
    },
    data() {
      return {
        pickedChipPointer: undefined as (ChipPointer | undefined),
        halfSize: 3,
      }
    },
    computed: {
      aspectRatio() {
        return this.board.raw.width + "/" + this.board.raw.height;
      },
      boardHeight() {
        return this.heightSize + "px";
      },
      sizeCoef() {
        return this.heightSize / this.board.raw.height;
      }
    },
    methods: {
      pickChip(index: number) {
        if (this.pickedChipPointer?.index == index) {
          this.pickedChipPointer = undefined;
        } else {
          this.pickedChipPointer = {
            board: this.boardPointer,
            index: index,
          }
        }
      },
      moveChip(event: MouseEvent) {
        if (this.pickedChipPointer === undefined) {
        } else {
          this.ws?.send(JSON.stringify({
            change_chip: {
              target: this.pickedChipPointer,
              changes: {
                coordinates: {
                  x: event.offsetX / this.sizeCoef,
                  y: event.offsetY / this.sizeCoef,
                }
              },
            }
          }));
        }
      },
    }
  }
</script>

<style scoped>

.board-background-image {
  height: v-bind(boardHeight);
  user-select: none;
  pointer-events: none;
  border-radius: 2vh;
}

.board {
  height: v-bind(boardHeight);
  position: relative;
}

</style>
