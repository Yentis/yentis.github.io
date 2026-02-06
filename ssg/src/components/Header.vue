<template>
  <div>
    <div class="header">
      <div>
        <q-btn
          class="q-mr-sm"
          color="secondary"
          icon="add"
          @click="onAddManga"
        />

        <q-btn
          color="primary"
          icon="refresh"
          @click="doFullRefresh()"
        />
      </div>
      <div>
        <q-btn
          class="q-mr-sm"
          color="primary"
          icon="backup"
          :loading="exporting"
          :disable="importing"
          @click="onExportList"
        />

        <q-btn
          color="primary"
          icon="cloud_download"
          :loading="importing"
          :disable="exporting"
          @click="onImportList"
        />
      </div>
      <q-btn
        flat
        round
        icon="settings"
        @click="showSettingsDialog"
      />
    </div>

    <div>
      <q-input
        v-model="searchValue"
        dense
        outlined
        class="q-mb-sm full-width"
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
        class="q-mr-sm"
        :label="'Sort by: ' + settings?.sortedBy"
      >
        <q-list
          v-for="type in sortTypes"
          :key="type"
        >
          <q-item
            v-close-popup
            clickable
            @click="setSortedBy(type)"
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
        @update:model-value="setFilters(newFilters)"
      >
        <q-option-group
          v-model="newFilters"
          class="q-mr-sm"
          type="checkbox"
          :options="statusList"
        />
      </q-btn-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import type { Ref } from 'vue'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { Status } from '../enums/statusEnum'
import { SortType } from '../enums/sortingEnum'
import useSettings from '../composables/useSettings'
import useRefreshing from '../composables/useRefreshing'
import useMangaList from '../composables/useMangaList'
import useCloudSync from '../composables/useCloudSync'
import { stateManager } from 'src/store/store-reader'
import { useObservable, useSubject, useSubscription } from '@vueuse/rxjs'

export default defineComponent({
  name: 'MangaHeader',

  props: {
    refreshProgress: {
      type: Number,
      required: true,
    },
  },

  emits: ['update:refreshProgress'],

  setup(props, context) {
    const { importList, exportList } = useCloudSync()
    const { addManga, storeManga, showAddMangaDialog, showEditMangaDialog, fetchManga } = useMangaList()
    const { refreshing$, settings$, mobileView$, searchValue$ } = stateManager

    const refreshProgress = computed({
      get: () => props.refreshProgress,
      set: (val) => {
        context.emit('update:refreshProgress', val)
      },
    })

    const { refreshTimer, startRefreshTimer, refreshAllManga } = useRefreshing(refreshProgress)

    const doFullRefresh = (): void => {
      if (refreshTimer.value) clearTimeout(refreshTimer.value)

      refreshAllManga()
        .finally(() => startRefreshTimer(settings$.value.refreshOptions))
        .catch(console.error)
    }

    const onAddManga = async (): Promise<void> => {
      const url = await showAddMangaDialog()
      if (!url) return

      refreshing$.next(true)
      const manga = await fetchManga(url)
      refreshing$.next(false)
      if (!manga) return

      const added = addManga(manga)
      if (added) storeManga()

      await showEditMangaDialog(url)
      refreshing$.next(false)
    }

    const newFilters: Ref<Status[]> = ref([])
    const { showSettingsDialog, setSortedBy, setFilters } = useSettings()

    onMounted(() => {
      startRefreshTimer(settings$.value.refreshOptions)
      newFilters.value = settings$.value.filters
    })

    useSubscription(
      settings$.subscribe((settings) => {
        startRefreshTimer(settings.refreshOptions)
      }),
    )

    const importing = ref(false)
    const onImportList = (): void => {
      importing.value = true

      importList()
        .finally(() => {
          importing.value = false
        })
        .catch(console.error)
    }

    const exporting = ref(false)
    const onExportList = (): void => {
      exporting.value = true

      exportList()
        .finally(() => {
          exporting.value = false
        })
        .catch(console.error)
    }

    const statusList = Object.values(Status).map((value) => {
      return {
        label: value,
        value: value,
      }
    })

    return {
      sortTypes: SortType,
      status: Status,

      mobileView: useObservable(mobileView$),
      searchValue: useSubject(searchValue$),
      statusList,

      importing,
      exporting,
      onImportList,
      onExportList,

      newFilters,
      settings: useObservable(settings$),
      showSettingsDialog,
      setSortedBy,
      setFilters,

      onAddManga,
      doFullRefresh,
    }
  },
})
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
}

.flex-column-between button {
  width: 100%;
}
</style>
