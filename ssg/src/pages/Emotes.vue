<template>
  <q-page>
    <q-input
      v-model="searchValue"
      dense
      outlined
      autofocus
      class="q-mt-sm q-px-sm full-width"
    >
      <template #append>
        <q-icon
          v-if="searchValue === ''"
          name="search"
        />
        <q-icon
          v-else
          name="clear"
          class="cursor-pointer"
          @click="searchValue = ''"
        />
      </template>
    </q-input>

    <div class="row justify-center q-gutter-sm q-mt-sm">
      <q-intersection
        v-for="(image, index) in filteredImageList"
        :key="index"
        class="intersection-item"
      >
        <q-card class="q-pa-xs">
          <img
            class="image"
            :src="image.url"
          >

          <q-card-section class="q-pt-xs q-px-none q-pb-none text-center">
            {{ image.name }}
          </q-card-section>
        </q-card>
      </q-intersection>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { Ref } from '@vue/runtime-core/dist/runtime-core'
import axios from 'axios'
import { Image } from 'src/classes/emotes/image'

export default defineComponent({
  name: 'PageEmotes',

  setup () {
    const imageList: Ref<Image[]> = ref([])
    const searchValue = ref('')

    const filteredImageList = computed(() => {
      return imageList.value.filter((image) => {
        return image.name.toLowerCase().includes(searchValue.value.toLowerCase())
      })
    })

    onMounted(() => {
      axios.get('https://yentis.github.io/emotes/emotes.json')
        .then((response) => {
          const data = (response as { data: Record<string, string> }).data
          imageList.value = Object.keys(data).map(key => {
            const split = data[key].split('.')
            return new Image(
              key,
              `https://yentis.github.io/emotes/images/${key}.${split[1]}`,
              split[0].replace('yent', '')
            )
          }).reverse()
        })
        .catch((error) => console.error(error))
    })

    return {
      imageList,
      searchValue,
      filteredImageList
    }
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
