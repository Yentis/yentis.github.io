<template>
  <q-page>
    <q-input
      dense
      outlined
      autofocus
      v-model="searchValue"
      class="q-my-sm q-px-sm full-width"
    >
      <template v-slot:append>
        <q-icon v-if="searchValue === ''" name="search" />
        <q-icon v-else name="clear" class="cursor-pointer" @click="searchValue = ''" />
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
          clickable
          v-close-popup
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
        class="q-mr-sm"
        type="checkbox"
        v-model="filters"
        :options="statusList"
      />
    </q-btn-dropdown>

    <a
      href="https://github.com/Yentis/manga-reader"
      class="text-primary text-bold"
    >Click here to make your own</a>

    <div class="q-mt-sm q-px-sm full-width" style="display: inline-block">
      <q-intersection
        v-for="manga in filteredMangaList"
        :key="manga.url"
        class="q-mb-xs full-width manga-item"
      >
        <manga-item :mangaJson="JSON.stringify(manga)" />
      </q-intersection>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { Manga } from 'src/classes/manga'
import { SortType } from 'src/enums/sorting'
import axios from 'axios'
import { Base64 } from 'js-base64'
import { mangaSort } from 'src/service/sortService'
import MangaItem from 'src/components/manga-item/MangaItem.vue'
import { Status } from 'src/enums/status'

export default defineComponent({
  name: 'PageManga',

  components: {
    MangaItem
  },

  data () {
    return {
      mangaList: [] as Manga[],
      searchValue: '',
      filters: [] as Status[],
      sortedBy: SortType.TITLE,
      sortType: SortType
    }
  },

  computed: {
    filteredMangaList (): Manga[] {
      return this.mangaList.filter(manga => {
        return manga.title.toLowerCase().includes(this.searchValue.toLowerCase()) &&
               this.filters.includes(manga.status)
      }).sort((a, b) => {
        return mangaSort(a, b, this.sortedBy)
      })
    },

    statusList () {
      return Object.values(Status).map(value => {
        return {
          label: value,
          value: value
        }
      })
    }
  },

  mounted () {
    const filters = localStorage.getItem('filters') || JSON.stringify(Object.values(Status))
    this.filters = JSON.parse(filters) as Status[]

    const sortedBy = localStorage.getItem('sorted_by') || SortType.TITLE
    this.sortedBy = sortedBy as SortType

    let id = this.$route.query.id as string
    if (id === undefined) return
    if (id === '2059191') id = '2147898'

    axios.get(`https://gitlab.com/api/v4/snippets/${id}/raw`)
      .then(response => {
        let data = response.data as string
        data = Base64.decode(data)
        data = data.substring(data.indexOf('['), data.lastIndexOf(']') + 1).trim()

        const mangaList = JSON.parse(data) as Manga[]
        this.mangaList = mangaList
      })
      .catch(error => console.error(error))
  },

  methods: {
    updateSortedBy (sortedBy: SortType) {
      this.sortedBy = sortedBy
      localStorage.setItem('sorted_by', sortedBy)
    },

    updateFilters () {
      localStorage.setItem('filters', JSON.stringify(this.filters))
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
