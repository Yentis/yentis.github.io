<template>
  <q-card-section>
    <q-input
      v-model="search"
      :placeholder="searchPlaceholder"
      @keydown.enter="onSearch(siteType)"
    >
      <template
        v-if="search"
        #append
      >
        <q-icon
          name="cancel"
          class="cursor-pointer"
          @click.stop="cancel"
        />
      </template>

      <template #after>
        <q-btn
          round
          dense
          flat
          icon="send"
          @click="onSearch(siteType)"
        />
      </template>
    </q-input>

    <q-btn
      v-if="searchResults.length > 0"
      no-caps
      class="q-mt-lg full-width manga-dropdown"
      :label="mangaTitle || 'Selected manga'"
    >
      <q-menu
        v-model="searchDropdownShown"
        auto-close
        :max-width="mobileView ? '60%' : '40%'"
        max-height="40%"
      >
        <q-list separator>
          <q-item
            v-for="manga in searchResults"
            :key="manga.url"
            clickable
            @click="selectUrl(manga)"
          >
            <q-item-section avatar>
              <q-img
                contain
                class="manga-image-search"
                :src="images[manga.image]"
              />
            </q-item-section>

            <q-item-section>
              <div class="text-subtitle2">
                {{ manga.title }}
              </div>
              <div class="text-body2">
                {{ manga.chapter }}
              </div>
              <div>{{ getSiteNameByUrl(manga.site) || 'Unknown site' }}</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <q-input
      v-if="searchResults.length === 0"
      :model-value="url"
      :placeholder="manualPlaceholder"
      @update:model-value="
        (value) => {
          $emit('update:url', value)
        }
      "
    />
  </q-card-section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import useMangaList from '../composables/useMangaList'
import { getSiteNameByUrl } from '../utils/siteUtils'
import type { SiteType } from 'src/enums/siteEnum'
import type { LinkingSiteType } from 'src/enums/linkingSiteEnum'
import { getSite } from 'src/services/siteService'
import { stateManager } from 'src/store/store-reader'
import { useObservable, useSubscription } from '@vueuse/rxjs'
import type { Manga } from 'src/classes/manga'

export default defineComponent({
  name: 'MangaSearch',

  props: {
    url: {
      type: String,
      default: '',
    },
    searchPlaceholder: {
      type: String,
      default: '',
    },
    manualPlaceholder: {
      type: String,
      default: '',
    },
    initialSearch: {
      type: String,
      default: '',
    },
    siteType: {
      type: String,
      default: '',
    },
    excludedUrls: {
      type: Array,
      default: () => [],
    },
  },

  emits: ['update:url'],

  setup(props, ctx) {
    const search = ref(props.initialSearch)
    const mangaTitle = ref('')
    const searchDropdownShown = ref(true)
    const { findManga } = useMangaList()
    const { searchResults$, mobileView$ } = stateManager

    const excludedUrls = props.excludedUrls.filter((url) => typeof url === 'string')

    const onSearch = async (siteTypeName = ''): Promise<void> => {
      const foundManga = await findManga(siteTypeName, search.value, excludedUrls)
      if (foundManga) searchDropdownShown.value = true
    }

    const record: Record<string, string> = {}
    const images = ref(record)

    const readImage = async (siteType: SiteType | LinkingSiteType, url: string): Promise<string> => {
      const site = getSite(siteType)
      return (await site?.readImage(url)) ?? url
    }

    const selectUrl = (manga: Manga): void => {
      ctx.emit('update:url', manga.url)
      mangaTitle.value = manga.title
    }

    const cancel = (): void => {
      search.value = ''
      searchResults$.next([])
    }

    useSubscription(
      searchResults$.subscribe((searchResults) => {
        searchResults.forEach((result) => {
          readImage(result.site, result.image)
            .then((image) => {
              images.value[result.image] = image
            })
            .catch((error) => {
              console.error(error)
              images.value[result.image] = result.image
            })
        })
      }),
    )

    return {
      search,
      mangaTitle,
      searchDropdownShown,
      searchResults: useObservable(searchResults$, { initialValue: [] }),
      images,
      mobileView: useObservable(mobileView$),
      onSearch,
      getSiteNameByUrl,
      selectUrl,
      cancel,
    }
  },
})
</script>

<style lang="scss" scoped>
.manga-image-search {
  min-width: 48px;
  width: 48px;
}

.manga-dropdown a {
  color: black;
  pointer-events: none;
}
</style>
