<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card>
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Add alternate sources</q-toolbar-title>
        <q-btn
          v-close-popup
          icon="close"
          flat
          round
          dense
        />
      </q-toolbar>

      <div class="q-mx-md q-mt-md text-body2">
        This will let you add additional sources for your manga. These will be used if your main source cannot be
        loaded.
      </div>

      <q-list
        v-if="data.length > 0"
        class="q-mt-sm"
        bordered
      >
        <q-item
          v-for="source in data"
          :key="source.url"
        >
          <q-item-section>
            <q-item-label>
              {{ source.name }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              color="negative"
              icon="delete"
              @click="removeUrl(source.url)"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <q-card-actions>
        <q-space />

        <q-btn
          flat
          class="q-pr-xs"
          color="positive"
          icon="add"
          @click="showAddDialog"
        />
      </q-card-actions>

      <q-card-actions>
        <q-space />

        <q-btn
          color="primary"
          :label="confirmButton"
          @click="onOKClick"
        />
        <q-btn
          v-close-popup
          label="Cancel"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent, useQuasar } from 'quasar'
import type { Ref } from 'vue'
import { defineComponent, onMounted, ref } from 'vue'
import type { SiteName, SiteType } from '../enums/siteEnum'
import { NotifyOptions } from '../classes/notifyOptions'
import SearchDialog from './SearchDialog.vue'
import { useClearingSearchResults } from '../composables/useSearchResults'
import { getSiteByUrl, getSiteNameByUrl } from '../utils/siteUtils'
import { stateManager } from 'src/store/store-reader'

export default defineComponent({
  props: {
    sources: {
      type: Object,
      required: true,
    },
    initialSearch: {
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
    confirmButton: {
      type: String,
      default: '',
    },
  },

  emits: [...useDialogPluginComponent.emits],

  setup(props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
    const { clearSearchResults } = useClearingSearchResults()
    const { notification$ } = stateManager

    const data: Ref<{ name: SiteName; site: SiteType; url: string }[]> = ref([])
    const sources: Ref<Record<string, string>> = ref(props.sources)

    const getSources = (): void => {
      sources.value = {}
      data.value.forEach((item) => {
        sources.value[item.site] = item.url
      })
    }

    const getData = (): void => {
      const dataList: typeof data.value = []
      Object.entries(sources.value).forEach(([source, url]) => {
        const siteType = getSiteByUrl(source)
        const siteName = getSiteNameByUrl(source)

        if (siteType === undefined || siteName === undefined) return
        dataList.push({
          name: siteName,
          site: siteType,
          url,
        })
      })
      data.value = dataList
    }
    onMounted(getData)

    const $q = useQuasar()
    const showAddDialog = (): void => {
      $q.dialog({
        component: SearchDialog,
        componentProps: {
          title: 'Add manga',
          initialSearch: props.initialSearch,
          searchPlaceholder: props.searchPlaceholder,
          manualPlaceholder: props.manualPlaceholder,
          confirmButton: props.confirmButton,
          excludedUrls: data.value.map((item) => item.url),
        },
      }).onOk((url: string) => {
        const siteType = getSiteByUrl(url)
        const siteName = getSiteNameByUrl(url)
        if (siteType === undefined || siteName === undefined) {
          notification$.next(new NotifyOptions(Error('Valid site not found')))
          return
        }

        data.value.push({ name: siteName, site: siteType, url })
      })
    }

    const removeUrl = (url: string): void => {
      data.value = data.value.filter((site) => site.url !== url)
    }

    return {
      dialogRef,
      onDialogHide: (): void => {
        clearSearchResults()
        onDialogHide()
      },
      onOKClick: (): void => {
        getSources()
        onDialogOK(sources.value)
      },
      onCancelClick: onDialogCancel,
      data,
      showAddDialog,
      removeUrl,
    }
  },
})
</script>

<style lang="scss" scoped>
.content {
  white-space: pre-wrap;
}
</style>
