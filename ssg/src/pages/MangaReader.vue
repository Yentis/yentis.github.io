<template>
  <q-page class="q-ma-sm">
    <MangaHeader />

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
        v-for="manga in filteredMangaList"
        :key="manga.url"
        class="q-mb-xs full-width manga-item"
      >
        <MangaItem :url="manga.url" />
      </q-intersection>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import MangaHeader from '../components/Header.vue'
import MangaItem from '../components/manga-item/MangaItem.vue'
import useMangaList from '../composables/useMangaList'
import useSettings from '../composables/useSettings'
import useSearchValue from '../composables/useSearchValue'
import useRefreshing from '../composables/useRefreshing'
import useRefreshProgress from '../composables/useRefreshProgress'
import { useStaticAuth } from '../composables/useAuthCallback'
import { getSiteNameByUrl } from '../services/siteService'

export default defineComponent({
  components: {
    MangaHeader,
    MangaItem
  },

  setup () {
    const { mangaList } = useMangaList()
    const { settings } = useSettings()
    const { searchValue } = useSearchValue()
    const { refreshing } = useRefreshing()
    const { refreshProgress } = useRefreshProgress()

    const filteredMangaList = computed(() => {
      return mangaList.value.filter(manga => {
        if (!settings.value.filters.includes(manga.status)) return false

        const searchWords = searchValue.value.split(' ')
        let title = true
        let notes = true
        let site = true

        return searchWords.every((word) => {
          const lowerCaseWord = word.toLowerCase()

          if (!manga.title.toLowerCase().includes(lowerCaseWord)) {
            title = false
          }

          if (!manga.notes?.toLowerCase().includes(lowerCaseWord)) {
            notes = false
          }

          const siteName = getSiteNameByUrl(manga.site)
          if (!siteName?.toLowerCase().includes(lowerCaseWord)) {
            site = false
          }

          return title || notes || site
        })
      })
    })

    useStaticAuth()

    return {
      mangaList,
      filteredMangaList,
      refreshing,
      refreshProgress
    }
  }
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
