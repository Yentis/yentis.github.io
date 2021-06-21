<template>
  <q-page>
    <q-input
      dense
      outlined
      autogrow
      v-model="content"
      label="Enter content from the $mmlist (or variations of it) here"
      class="q-mt-sm q-px-sm full-width input-area"
      input-style="max-height: 5rem"
    >
      <template v-slot:append>
        <q-icon v-if="content === ''" name="navigate_next" />
        <q-icon v-else name="clear" class="cursor-pointer" @click="content = ''" />
      </template>
    </q-input>

    <div class="row justify-center q-gutter-sm q-mt-sm">
      <q-intersection
        v-for="(character, index) in characterList"
        :key="index"
        class="intersection-item"
      >
        <q-card  class="q-pa-xs">
          <q-card-section class="q-pb-xs q-px-none q-pt-none text-center">
            <span class="text-bold">#{{ character.rank }}</span>
            <br>
            {{ character.name }}
          </q-card-section>

          <img class="image" :src="character.url">

          <q-card-section class="q-pt-xs q-px-none q-pb-none text-center">
            {{ character.kakera }} ka
          </q-card-section>
        </q-card>
      </q-intersection>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { Character } from 'src/classes/character'

export default defineComponent({
  name: 'PageMudae',

  data () {
    return {
      characterList: [] as Character[],
      content: ''
    }
  },

  watch: {
    content (content: string) {
      const lines = content.split('\n')

      const characterList = lines.filter(line => line.trim() !== '').map(line => {
        const imageText = line.substring(line.lastIndexOf('-') + 1)
        const url = imageText.substring(1).trim()
        line = line.replace(imageText, '')

        const rankText = line.substring(0, Math.max(0, line.indexOf('-')))
        const rank = rankText.substring(rankText.indexOf('#') + 1).trim()
        line = line.replace(rankText, '')

        const kakeraMatch = line.substring(0, line.length - 1).trim().match(/\b\d+ ka\b/g)
        const kakera = (kakeraMatch !== null && kakeraMatch.length > 0) ? kakeraMatch[kakeraMatch.length - 1] : ''
        line = line.replace(kakera, '')

        const nameText = line.substring(0, Math.max(0, line.lastIndexOf('-')))
        const name = nameText.substring(nameText.indexOf('-') + 1, nameText.indexOf('·') > 0 ? nameText.indexOf('·') : nameText.length - 1).trim()
        line = line.replace(nameText, '')

        return new Character(
          !isNaN(parseInt(rank)) ? parseInt(rank) : 0,
          name,
          url,
          !isNaN(parseInt(kakera)) ? parseInt(kakera) : 0
        )
      })

      this.characterList = characterList
    }
  }
})
</script>

<style scoped>
  .intersection-item {
    height: 280px;
    min-width: 155px;
  }

  .image {
    height: 200px;
    width: auto;
    margin-left: auto;
    margin-right: auto;
  }
</style>
