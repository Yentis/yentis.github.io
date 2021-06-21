<template>
  <q-page>
    <q-input
      dense
      outlined
      autofocus
      v-model="searchValue"
      class="q-mt-sm q-px-sm full-width"
    >
      <template v-slot:append>
        <q-icon v-if="searchValue === ''" name="search" />
        <q-icon v-else name="clear" class="cursor-pointer" @click="searchValue = ''" />
      </template>
    </q-input>

    <div class="row justify-center q-gutter-sm q-mt-sm">
      <q-intersection
        v-for="(image, index) in filteredImageList"
        :key="index"
        class="intersection-item"
      >
        <q-card class="q-pa-xs">
          <img class="image" :src="image.url">

          <q-card-section class="q-pt-xs q-px-none q-pb-none text-center">
            {{ image.name }}
          </q-card-section>
        </q-card>
      </q-intersection>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import axios from 'axios'
import { Image } from 'src/classes/image'

export default defineComponent({
  name: 'PageEmotes',

  data () {
    return {
      imageList: [] as Image[],
      searchValue: ''
    }
  },

  computed: {
    filteredImageList (): Image[] {
      return this.imageList.filter(image => {
        return image.name.toLowerCase().includes(this.searchValue.toLowerCase())
      })
    }
  },

  mounted () {
    axios.get('https://yentis.github.io/emotes/emotes.json')
      .then(response => {
        const data = (response as { data: Record<string, string> }).data
        this.imageList = Object.keys(data).map(key => {
          const split = data[key].split('.')
          return new Image(
            key,
            `https://yentis.github.io/emotes/images/${key}.${split[1]}`,
            split[0].replace('yent', '')
          )
        }).reverse()
      })
      .catch(error => console.error(error))
  }
})
</script>

<style scoped>
  .intersection-item {
    height: 135px;
    min-width: 275px;
  }

  .image {
    height: 100px;
    width: auto;
    margin-left: auto;
    margin-right: auto;
  }
</style>
