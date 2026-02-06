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
import type { Ref } from 'vue';
import { defineComponent, ref, computed, onMounted } from 'vue'
import { Image } from '../classes/emotes/image'
import { NotifyOptions } from '../classes/notifyOptions'
import type { HttpRequest } from '../interfaces/httpRequest'
import type HttpResponse from '../interfaces/httpResponse'
import { requestHandler } from '../services/requestService'
import { stateManager } from 'src/store/store-reader'

export default defineComponent({
  name: 'PageEmotes',

  setup () {
    const { notification$ } = stateManager
    const imageList: Ref<Image[]> = ref([])
    const searchValue = ref('')

    const filteredImageList = computed(() => {
      return imageList.value.filter((image) => {
        return image.name.toLowerCase().includes(searchValue.value.toLowerCase())
      })
    })

    onMounted(() => {
      const request: HttpRequest = { method: 'GET', url: 'https://yentis.github.io/emotes/emotes.json' }
      requestHandler.sendRequest(request).then((response: HttpResponse) => {
        const data = JSON.parse(response.data) as Record<string, string>

        imageList.value = Object.keys(data).map(key => {
          const split = data[key]?.split('.') || []
          const name = split[0]?.replace('yent', '') || ''
          const extension = split[1] || 'png'

          return new Image(
            key,
            `https://yentis.github.io/emotes/images/${key}.${extension}`,
            name
          )
        }).reverse()
      }).catch((error: Error) => {
        notification$.next(new NotifyOptions(error, 'Failed to retrieve emotes'))
      })
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
