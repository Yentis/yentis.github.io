<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card>
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>{{ title }}</q-toolbar-title>
        <q-btn
          v-close-popup
          icon="close"
          flat
          round
          dense
        />
      </q-toolbar>

      <MangaSearch
        v-model:url="url"
        :content="content"
        :search-placeholder="searchPlaceholder"
        :manual-placeholder="manualPlaceholder"
        :initial-search="initialSearch"
        :site-type="siteType"
        :excluded-urls="excludedUrls"
      />

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
import type { QDialog } from 'quasar'
import { useDialogPluginComponent } from 'quasar'
import type { Ref, UnwrapRef } from 'vue'
import { ref } from 'vue'
import MangaSearch from './SearchComponent.vue'
import { useClearingSearchResults } from 'src/composables/useSearchResults'

export default {
  components: {
    MangaSearch,
  },

  props: {
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
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
    siteType: {
      type: String,
      default: undefined,
    },
    confirmButton: {
      type: String,
      default: '',
    },
    excludedUrls: {
      type: Array,
      default: (): string[] => [],
    },
  },

  emits: [...useDialogPluginComponent.emits],

  setup(): {
    dialogRef: Ref<QDialog | undefined>
    onDialogHide: () => void
    onOKClick: () => void
    onCancelClick: () => void
    url: Ref<UnwrapRef<string>, UnwrapRef<string>>
  } {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
    const { clearSearchResults } = useClearingSearchResults()
    const url = ref('')

    return {
      dialogRef,
      onDialogHide: (): void => {
        clearSearchResults()
        onDialogHide()
      },
      onOKClick: (): void => {
        onDialogOK(url.value)
      },
      onCancelClick: onDialogCancel,
      url,
    }
  },
}
</script>
