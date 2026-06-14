<template>
  <div class="card-inner card-inner-visible" v-if="showCardPictures && card.card_picture_url != undefined && card.card_picture_url?.replaceAll(' ', '') != ''" >
    <img 
      class="card-picture"
      :src="card.card_picture_url"
    />
  </div>
  <div class="card-inner card-inner-visible" v-else-if="card.visible_to_me">
    <div class="top-part">
      <div v-if="['main'].indexOf(card.nature ?? '') != -1" class="cost">
        <span class="cost-span"> {{card.cost}} </span>
      </div>

      <div v-if="card.color_cost?.length ?? 0 > 0"class="color-cost">
        <span class="color-cost-span" v-html="marked(`\`${card.color_cost?.join(' ')}\``)">
           
        </span>
      </div>

      <div v-if="['Spell', 'Gear', 'Rune', 'Battlefield', 'attack', 'defence', 'versatile', 'scheme'].indexOf(card.type ?? '') == -1" class="might">
        <span class="power"> {{card.power}} </span>
        <span class="health"> {{card.health}} </span>
      </div>
      
      <span class="colors" v-if="(card.colors ?? []).length > 0" v-html="marked(`\`${ (card.colors ?? []).join('\n') }\``)"/> 

      <img v-if="card.art_url != ''" class="art" :src="card.art_url"/>

      <div class="tags">
        <div v-for="tag in card.tags" class="tag">
          <span class="tag-span"> {{tag}} </span>
        </div>
      </div>
    </div>
    <div class="bottom-part">
      <span class="name" v-html="card.name?.replaceAll(' | ', '\n')">  </span>
      <span class="description" v-html="marked( `${card.description?.replaceAll('; ', '.\n\n')}` )">  </span>
      <span class="comments" v-if="card.comments.length > 0" v-html="marked( `${card.comments.replaceAll('; ', '.\n\n')}` )">  </span>
      <span class="rarity"> {{card.rarity}} </span>
    </div> 
  </div>
  <div v-else class="card-inner" style="background-color: grey"/>
</template>

<script lang="ts">
  import { getColor, type Card } from '@/structs';
  import type { PropType } from 'vue';
  import { marked } from 'marked';
import { getViewCardPictures } from '@/sharedReactive';

  export default {
    props: {
      size: {
        type: Number,
        default: 200,
      },
      card: {
        type: Object as PropType<Card>,
        required: true,
      },
    },
    data() {
      return {
        bgrColorLighter: "#36302c",
        bgrColor: "#2c2623",
        bgrColorDarker: "#151312",
        hintColor: "#777777",
        shadow: "black 0px 0px 10px",
        marked,
      }
    },
    computed: {
      accentBackground() {
        let colors = this.card.colors ?? [];
        if (colors.length == 0) return this.bgrColorDarker;
        return getColor(colors);
      },
      showCardPictures() {
        return getViewCardPictures();
      },
      width() {
        return this.size + "px";
      },
      borderWidth() {
        if (this.card.card_picture_url != undefined && this.card.card_picture_url.replaceAll(" ", "") != "") {
          return (this.size / 40) + "px";
        }
        return (this.size / 20) + "px";
      },
      smallPadding() {
        return (this.size / 40) + "px";
      },
      tooSmallPadding() {
        return (this.size / 80) + "px";
      },
      tootooSmallPadding() {
        return (this.size / 160) + "px";
      },
      borderRadius() {
        if (this.card.card_picture_url != undefined && this.card.card_picture_url.replaceAll(" ", "") != "") {
          return (this.size * 0.08) + "px";
        }
        return (this.size * 0.10) + "px";
      },
      innerRadius() {
        return (Math.max(0, this.size * 0.10 - this.size / 20)) + "px"
      },
      nameFont() {
        return (this.size * 0.08) + "px"
      },
      nameFontHalf() {
        return (this.size * 0.08 / 2) + "px"
      },
      middleFont() {
        return (this.size * 0.075) + "px"
      },
      descriptionFont() {
        return (this.size * 0.05) + "px"
      },
      costWidth() {
        return (this.size * 0.15) + "px"
      },
      colorCostHeight() {
        return (this.size * 0.10) + "px"
      },
      costCoord() {
        return (0) + "px";
      },
      colorCostPadding() {
        return this.size * 0.2 / 2 + "px";
      },
      colorCostLeft() {
        return (this.size * 0.15 / 2) + "px";
      },
      colorCostTop() {
        return (this.size * 0.025) + "px";
      },
      tagsHeight() {
        return this.size * 0.07 + "px";
      },
      hintFont() {
        return this.size * 0.035 + "px";
      },
      artTopPadding() {
        return -this.size * 0.035 + "px";
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
      }
    }
  };
</script>

<style>

.card-picture {
  border-radius: v-bind(innerRadius);
  width: 100%;
  height: 100%;
  position: absolute;
  object-fit: cover;
  object-position: 50% 50%;
  pointer-events: none;
}

.art {
  border-radius: v-bind(innerRadius) v-bind(innerRadius) 0px 0px;
  width: 100%;
  height: 100%;
  position: absolute;
  object-fit: cover;
  object-position: 50% v-bind(artTopPadding);
  pointer-events: none;
}

code {
  font-family: 'FiraCode';
  letter-spacing: -0.1vh;
}

em {
  background: v-bind(accentBackground);
  padding: 0px v-bind(tooSmallPadding);
  border-radius: v-bind(smallPadding) v-bind(tooSmallPadding);
}

.top-part {
  width: 100%;
  border-radius: v-bind(innerRadius) v-bind(innerRadius) 0px 0px;
  flex: auto;
  background: v-bind(bgrColorLighter);
  position: relative;
}
.bottom-part {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 0;
}

.card-inner {
  width: v-bind(width);
  user-select: none;
  aspect-ratio: 0.75;
  border-radius: v-bind(borderRadius);
  border-width: v-bind(borderWidth);
  border-style: solid;
  border-color: v-bind(borderColor);
  position: relative;
  display: flex;
  flex-direction: column;
}

.card-inner-visible {
  background-color: v-bind(bgrColor);
}

ul {
  padding-left: v-bind(nameFont);
}

span {
  font-family: "LeagueGothic";
  color: white;
}

.name {
  line-height: 50px;
  white-space: pre-wrap;
  font-family: 'Radley';
  font-size: v-bind(nameFont);
  padding: v-bind(smallPadding) v-bind(borderWidth);
  line-height: 1;
  background: v-bind(accentBackground);
}
.description {
  text-align: start;
  line-height: 1.3;
  font-family: 'RobotoCondensed';
  font-size: v-bind(descriptionFont);
  margin: v-bind(smallPadding) v-bind(borderWidth) v-bind(borderWidth) v-bind(borderWidth);
}
.comments {
  text-align: center;
  line-height: 1.3;
  font-family: 'RobotoCondensed';
  font-size: v-bind(descriptionFont);
  margin: 0 v-bind(borderWidth) v-bind(borderWidth) v-bind(borderWidth);
}
/*  --- cost --- */

.color-cost {
  display: flex;
  position: absolute;
  justify-self: center;
  border-radius: v-bind(costWidth);
  top: v-bind(colorCostTop);
  left: v-bind(colorCostLeft);
  height: v-bind(colorCostHeight);
  padding: v-bind(smallPadding);
  padding-left: v-bind(colorCostPadding);
  background-color: v-bind(bgrColorDarker);
  z-index: 5;
}

.color-cost-span {
  font-size: v-bind(descriptionFont);
  line-height: 1;
}

.might {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  border-radius: v-bind(costWidth) v-bind(innerRadius) v-bind(costWidth) v-bind(costWidth);
  top: v-bind(costCoord);
  right: v-bind(costCoord);
  min-width: v-bind(costWidth);
  height: v-bind(costWidth);
  padding: v-bind(smallPadding);
  background-color: v-bind(bgrColor);
  z-index: 10;
  box-shadow: v-bind(shadow);
}

.power {
  font-family: 'FiraCode';
  font-size: v-bind(middleFont);
  background: v-bind(accentBackground);
  border-radius: v-bind(middleFont);
  box-shadow: v-bind(shadow);
  margin-right: v-bind(smallPadding);
 /* outline: v-bind(tootooSmallPadding) solid black;*/
}

/*  --- might ---  */

.health {
  font-family: 'FiraCode';
  font-size: v-bind(middleFont);
}

.cost {
  display: flex;
  position: absolute;
  flex-direction: row;
  align-items: center;
  border-radius: v-bind(innerRadius) 50% 50% 50%;
  top: v-bind(costCoord);
  left: v-bind(costCoord);
  width: v-bind(costWidth);
  height: v-bind(costWidth);
  padding: v-bind(smallPadding);
  background-color: v-bind(bgrColor);
  z-index: 10;
  box-shadow: v-bind(shadow);
}

.cost-span {
  font-family: 'FiraCode';
  font-size: v-bind(nameFont);
  text-align: center;
  width: v-bind(costWidth);
}

/*  --- tags ---  */

.tags {
  display: flex;
  position: absolute;
  flex-direction: row;
  align-items: center;
  bottom: v-bind(costCoord);
  left: v-bind(costCoord);
  z-index: 10;
  margin-bottom: v-bind(tooSmallPadding);
  margin-left: v-bind(borderWidth);
}

.tag {
  background-color: v-bind(bgrColor);
  margin-right: v-bind(tooSmallPadding);
  height: v-bind(tagsHeight);
  display: flex;
  align-items: center;
  padding: v-bind(tooSmallPadding);
  border-radius: v-bind(tooSmallPadding);
  box-shadow: v-bind(shadow);
}

.tag-span {
  font-size: v-bind(descriptionFont);
}

/*  --- rarity --- */

.rarity {
  color: v-bind(hintColor);
  font-size: v-bind(hintFont);
  position: absolute;
  bottom: 0px;
  width: 100%;
  text-align: center;
}

/* --- colors --- */ 
.colors {
  font-size: v-bind(descriptionFont);
  position: absolute;
  border-radius: v-bind(nameFontHalf) 0 0 v-bind(nameFontHalf);
  background: v-bind(accentBackground);
  min-width: v-bind(nameFont);
  bottom: v-bind(smallPadding);
  padding-left: v-bind(tooSmallPadding);
  right: 0px;
  text-align: center;
  z-index: 10;
  box-shadow: v-bind(shadow);
}
</style>
