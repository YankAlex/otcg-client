<template>
  <div class="chip">
    <img class="chip-art" :src="chip.raw?.art_url"/>
  </div>
</template>

<script lang="ts">
import { getColor, type Chip } from '@/structs';
import type { PropType } from 'vue';

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
      ws: {
        type: WebSocket,
        required: true,
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
    }
  }
</script>
  
<style scoped>
.chip {
  position: absolute;
  transition: ease 0.5s;
  height: 4vh;
  aspect-ratio: 1/1;
  background-color: v-bind(bkgColor);
  border-radius: 50%;
  box-shadow: v-bind(shadow);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-art {
  height: 3vh;
  aspect-ratio: 1/1;
  border-radius: 50%;
}
</style>
