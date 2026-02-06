<template>
  <q-page class="q-ma-sm">
    <MangaHeader v-model:refresh-progress="refreshProgress" />

    <q-linear-progress
      v-if="refreshing"
      :indeterminate="refreshProgress === 0"
      :value="refreshProgress"
      instant-feedback
      size="xl"
      class="q-mt-sm"
    />

    <div class="manga-container q-mt-sm full-width">
      <q-intersection
        v-for="url in mangaUrls"
        :key="url"
        class="q-mb-xs full-width manga-item"
      >
        <MangaItem :url="url" />
      </q-intersection>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import MangaHeader from '../components/Header.vue'
import MangaItem from '../components/manga-item/MangaItem.vue'
import { getSiteNameByUrl } from '../utils/siteUtils'
import {
  useAppInitialized,
  useCapacitorInitialized,
  useElectronInitialized,
  useStaticInitialized,
} from '../composables/useInitialized'
import { getPlatform } from '../services/platformService'
import { Platform } from '../enums/platformEnum'
import type { Manga } from '../classes/manga'
import { mangaSort } from '../services/sortService'
import { stateManager } from 'src/store/store-reader'
import { combineLatest, map } from 'rxjs'
import { useObservable } from '@vueuse/rxjs'

export default defineComponent({
  components: {
    MangaHeader,
    MangaItem,
  },

  setup() {
    useAppInitialized()

    const refreshProgress = ref(0)
    const { mangaMap$, settings$, searchValue$, refreshing$ } = stateManager

    const mangaUrls$ = combineLatest([mangaMap$, settings$, searchValue$]).pipe(
      map(([mangaMap, settings, searchValue]) => {
        const matchedManga: Manga[] = []

        mangaMap.forEach((manga) => {
          if (!settings.filters.includes(manga.status)) return

          const searchWords = searchValue.split(' ')
          let title = true
          let notes = true
          let site = true

          const containsWords = searchWords.every((word) => {
            const lowerCaseWord = word.toLowerCase()

            if (!manga.title.toLowerCase().includes(lowerCaseWord)) {
              title = false
            }

            if (manga.notes?.toLowerCase().includes(lowerCaseWord) !== true) {
              notes = false
            }

            const siteName = getSiteNameByUrl(manga.site)
            if (
              siteName?.toLowerCase().includes(lowerCaseWord) !== true &&
              !manga.site.replace('.', '').includes(lowerCaseWord)
            ) {
              site = false
            }

            return title || notes || site
          })
          if (!containsWords) return

          matchedManga.push(manga)
        })

        return matchedManga
          .sort((a, b) => {
            return mangaSort(a, b, settings.sortedBy)
          })
          .map((manga) => manga.url)
      }),
    )

    switch (getPlatform()) {
      case Platform.Capacitor:
        useCapacitorInitialized()
        break
      case Platform.Electron:
        useElectronInitialized()
        break
      case Platform.Static:
        useStaticInitialized()
        break
    }

    return {
      mangaUrls: useObservable(mangaUrls$),
      refreshing: useObservable(refreshing$),
      refreshProgress,
    }
  },
})
</script>

<style lang="scss">
.flex-column-between {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

a {
  text-decoration: none;
  color: $primary;
}

.manga-container {
  display: inline-block;
}

.manga-item {
  min-height: 11rem;
}
</style>
