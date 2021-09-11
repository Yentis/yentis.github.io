<template>
  <q-page>
    <q-input
      v-model="searchValue"
      dense
      outlined
      autofocus
      class="q-my-sm q-px-sm full-width"
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

    <q-btn-dropdown
      no-caps
      class="q-mx-sm"
      :label="'Sort by: ' + sortedBy"
    >
      <q-list
        v-for="type in sortType"
        :key="type"
      >
        <q-item
          v-close-popup
          clickable
          @click="updateSortedBy(type)"
        >
          <q-item-section>
            <q-item-label>{{ type }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <q-btn-dropdown
      no-caps
      label="Filters"
      @input="updateFilters"
    >
      <q-option-group
        v-model="filters"
        class="q-mr-sm"
        type="checkbox"
        :options="statusList"
      />
    </q-btn-dropdown>

    <a
      href="https://github.com/Yentis/manga-reader"
      class="text-primary text-bold"
    >Click here to make your own</a>

    <div
      class="q-mt-sm q-px-sm full-width"
      style="display: inline-block"
    >
      <q-intersection
        v-for="manga in filteredMangaList"
        :key="manga.url"
        class="q-mb-xs full-width manga-item"
      >
        <manga-item-simple :manga-json="JSON.stringify(manga)" />
      </q-intersection>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Manga } from 'src/classes/manga'
import { SortType } from 'src/enums/sortingEnum'
import axios from 'axios'
import { Base64 } from 'js-base64'
import { mangaSort } from 'src/services/sortService'
import MangaItemSimple from 'src/components/manga-item-simple/MangaItemSimple.vue'
import { Status } from 'src/enums/statusEnum'
import { SiteName } from 'src/enums/siteEnum'

export default defineComponent({
  name: 'PageManga',

  components: {
    MangaItemSimple
  },

  setup () {
    const mangaList: Ref<Manga[]> = ref([])
    const searchValue = ref('')
    const filters: Ref<Status[]> = ref([])
    const sortedBy = ref(SortType.TITLE)

    const filteredMangaList = computed(() => {
      return mangaList.value.filter((manga) => {
        if (!filters.value.includes(manga.status)) return false

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

          if (!SiteName[manga.site]?.toLowerCase().includes(lowerCaseWord)) {
            site = false
          }

          return title || notes || site
        })
      }).sort((a, b) => {
        return mangaSort(a, b, sortedBy.value)
      })
    })

    const statusList = computed(() => {
      return Object.values(Status).map(value => {
        return {
          label: value,
          value: value
        }
      })
    })

    const updateSortedBy = (newSortedBy: SortType) => {
      sortedBy.value = newSortedBy
      localStorage.setItem('sorted_by', newSortedBy)
    }

    const updateFilters = () => {
      localStorage.setItem('filters', JSON.stringify(filters.value))
    }

    const $route = useRoute()

    onMounted(() => {
      const storedFilters = localStorage.getItem('filters') || JSON.stringify(Object.values(Status))
      filters.value = JSON.parse(storedFilters) as Status[]

      const storedSortedBy = localStorage.getItem('sorted_by') || SortType.TITLE
      sortedBy.value = storedSortedBy as SortType

      let id = $route.query.id as string
      if (id === undefined) return
      if (id === '2059191') id = '2147898'

      axios.get(`https://gitlab.com/api/v4/snippets/${id}/raw`)
        .then(response => {
          let data = response.data as string
          data = Base64.decode(data)
          data = data.substring(data.indexOf('['), data.lastIndexOf(']') + 1).trim()

          const parsedMangalist = JSON.parse(data) as Manga[]
          mangaList.value = parsedMangalist
        })
        .catch(error => console.error(error))
    })

    return {
      mangaList,
      searchValue,
      filters,
      sortedBy,
      filteredMangaList,
      statusList,
      updateSortedBy,
      updateFilters,
      sortType: SortType
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

  .manga-item {
    min-height: 11rem;
  }
</style>
