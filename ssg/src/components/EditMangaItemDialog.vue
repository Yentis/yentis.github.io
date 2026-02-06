<template>
  <q-dialog
    ref="dialogRef"
    :full-width="true"
    @hide="onDialogHide"
  >
    <MangaItem
      :url="url"
      :initial-editing="true"
      @manga-saved="onOKClick"
      @manga-removed="onCancelClick"
    />
  </q-dialog>
</template>

<script lang="ts">
import type { QDialog } from 'quasar'
import { useDialogPluginComponent } from 'quasar'
import MangaItem from '../components/manga-item/MangaItem.vue'
import type { Ref } from 'vue'

export default {
  components: {
    MangaItem,
  },

  props: {
    url: {
      type: String,
      required: true,
    },
  },

  emits: [...useDialogPluginComponent.emits],

  setup(): {
    dialogRef: Ref<QDialog | undefined>
    onDialogHide: () => void
    onOKClick: (payload?: unknown) => void
    onCancelClick: () => void
  } {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

    return {
      dialogRef,
      onDialogHide,
      onOKClick: onDialogOK,
      onCancelClick: onDialogCancel,
    }
  },
}
</script>
