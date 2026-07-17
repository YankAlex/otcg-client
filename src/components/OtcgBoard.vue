<template>
  <div 
    class="board"
    @mouseup="moveChip"
    @mouseleave="moveChip"
    @mousemove="moveChipView"
    @touchend="moveChip"
    @touchmove="moveTouchChipView"
  >
    <img :src="board.img_url" class="board-background-image">
    <div v-if="pickedChipPointer !== undefined" class="chip-preview"
         :style="`top: ${(movingCoordinates.y - bigHalfSize) * sizeCoef}px; left: ${(movingCoordinates.x - bigHalfSize) * sizeCoef}px;`"
    />
    <OtcgChip
      v-for="(chip, index) in board.chips"
      :style="position(index)"
      @mousedown.prevent="setMovingChip(index, $event)"
      @touchstart="setTouchMovingChip(index, $event)"
      :picked="pickedChipPointer?.index == index"
      :pointer="{index: index, board: boardPointer}"
      :chip
      :ws
    />
  </div>
</template>

<script lang="ts">
  import type { Board, BoardPointer, Chip, ChipPointer, Coordinates } from '@/structs';
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
        halfSize: 3.5,
        bigHalfSize: 5.9,
        movingCoordinates: {x: 0, y: 0},
        mouseStart: {x: 0, y: 0},
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
      position(index: number) {
        return 'left: ' + (((this.board.chips[index]?.coordinates.x ?? 0) - this.halfSize) * this.sizeCoef) + 'px; top: ' + ((this.board.chips[index]?.coordinates.y ?? 0) - this.halfSize) * this.sizeCoef + 'px; transition: ease 0.5s;' 
      },
      setMovingChip(index: number, event: MouseEvent) {
        this.pickedChipPointer = {
          board: this.boardPointer,
          index: index,
        };
        this.mouseStart.x = event.pageX;
        this.mouseStart.y = event.pageY;
        this.movingCoordinates.x = this.board.chips[index]?.coordinates.x ?? 0;
        this.movingCoordinates.y = this.board.chips[index]?.coordinates.y ?? 0;
      },
      setTouchMovingChip(index: number, event: TouchEvent) {
        if (event.touches.length != 1) return;
        this.pickedChipPointer = {
          board: this.boardPointer,
          index: index,
        };
        this.mouseStart.x = event.touches[0]?.pageX ?? 0;
        this.mouseStart.y = event.touches[0]?.pageY ?? 0;
        this.movingCoordinates.x = this.board.chips[index]?.coordinates.x ?? 0;
        this.movingCoordinates.y = this.board.chips[index]?.coordinates.y ?? 0;
      },
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
      moveChip() {
        if (this.pickedChipPointer === undefined) {
        } else {
          this.ws?.send(JSON.stringify({
            change_chip: {
              target: this.pickedChipPointer,
              changes: {
                coordinates: {
                  x: this.movingCoordinates.x,
                  y: this.movingCoordinates.y,
                }
              },
            }
          }));
          this.pickedChipPointer = undefined;
        }
      },
      moveChipView(event: MouseEvent) {
        if (this.pickedChipPointer === undefined) {
        } else {
          let realCord = this.board.chips[this.pickedChipPointer.index]?.coordinates ?? { x: 0, y: 0 };
          // @ts-ignore
          this.movingCoordinates.x = (event.pageX - this.mouseStart.x)  / this.sizeCoef + realCord.x;
          // @ts-ignore
          this.movingCoordinates.y = (event.pageY - this.mouseStart.y)  / this.sizeCoef + realCord.y;
        }
      },
      moveTouchChipView(event: TouchEvent) {
        if (this.pickedChipPointer === undefined) {
        } else {
          event.preventDefault();
          let realCord = this.board.chips[this.pickedChipPointer.index]?.coordinates ?? { x: 0, y: 0 };
          // @ts-ignore
          this.movingCoordinates.x = (event.touches[0].pageX - this.mouseStart.x)  / this.sizeCoef + realCord.x;
          // @ts-ignore
          this.movingCoordinates.y = (event.touches[0].pageY - this.mouseStart.y)  / this.sizeCoef + realCord.y;
        }
      },
    },
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

.chip-preview {
  position: absolute;
  height: 8vh;
  aspect-ratio: 1/1;
  border: dashed #adff2f 0.5vh;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
}

</style>
