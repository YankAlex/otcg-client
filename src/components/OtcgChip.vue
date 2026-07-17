<template>
  <div class="chip" @contextmenu.prevent.stop="contextMenu = true">
      <div  v-if="contextMenu" class="changes-chip-panel"> 
        <div class="changes-chip-column">
          <span class="changes-chip-label" @click="changeHealth(1)"> Health: {{chip.health}} / {{chip.raw?.health}} </span>
          <button class="changes-chip-button" @click="changeHealth(1)"> <code> H++ </code> </button>
          <button class="changes-chip-button" @click="changeHealth(-1)"> <code> H-- </code> </button>
          <button class="changes-chip-button" @click="contextMenu = false"> <code> Close </code> </button>
        </div>
      </div>
    <img class="chip-art" :src="chip.raw?.art_url"/>
    <span class="health"> {{chip.health}} </span>
    <span class="name"> {{chip.raw?.name.split("|").at(-1)?.trim()}} </span>
  </div>
</template>

<script lang="ts">
import { getColor, type Chip, type ChipPointer } from '@/structs';
import { type PropType } from 'vue';

  export default {
    props: {
      picked: {
        type: Boolean,
        required: true,
      },
      chip: {
        type: Object as PropType<Chip>,
        required: true,
      },
      pointer: {
        type: Object as PropType<ChipPointer>,
        required: true,
      },
      ws: {
        type: WebSocket,
        required: true,
      }
    },
    data() {
      return {
        contextMenu: false,
      }
    },
    computed: {
      shadow() {
        if (this.picked) {
          return "#000000ff 0px 5px 3vh"
        } else {
          return "#000000dd 0px 0px 3vh"
        }
      },
      bkgColor() {
        return getColor(this.chip.raw?.colors ?? []);
      },
    },
    methods: {
      changeHealth(d: number) {
        this.ws?.send(JSON.stringify({change_chip: {target: this.pointer, changes: {health: (this.chip.health ?? 0) + d}}}));
      },
    }
  }
</script>
  
<style scoped>
.chip {
  position: absolute;
  height: 5vh;
  aspect-ratio: 1/1;
  background-color: v-bind(bkgColor);
  border-radius: 50%;
  box-shadow: v-bind(shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
}

.chip-art {
  height: 4vh;
  aspect-ratio: 1/1;
  border-radius: 50%;
}

.health {
  position: absolute;
  top: 0vh;
  font-family: "LeagueGothic";
  background-color: v-bind(bkgColor);
  padding: 0vh 0.2vh;
  line-height: 4vh;
  font-size: 3vh;
  border-radius: 1.5vh;
}

.name {
  position: absolute;
  top: 3vh;
  font-family: "LeagueGothic";
  text-align: center;
  background-color: v-bind(bkgColor);
  border-radius: 1.5vh;
  font-size: 2vh;
}

.changes-chip-column {
  display: flex;
  flex-direction: column;
  width: 20vh;
}

.changes-chip-panel {
  display: flex;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  padding: 1vh;
  box-shadow: v-bind(shadow);
  border-radius: 10px;
  z-index: 1000;
  position: absolute;
  flex-direction: row;
  left: 5vh;
  width: 32vh;
}

.changes-chip-button {
  font-size: 2vh;
  width: 30vh;
  height: 5vh;
  margin-top: 1vh;
}

.changes-chip-label {
  font-size: 4vh;
  width: 30vh;
  height: 5vh;
}
</style>
