<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card>
      <q-list class="q-mt-md">
        <q-item
          v-for="error in errors"
          :key="error.message + (error.caption ?? '')"
          class="column"
        >
          <q-item-section class="overflow-auto">
            <q-item-label :class="{ 'text-subtitle2': mobileView, 'text-h6': !mobileView }">
              {{ error.message }}
            </q-item-label>
            <q-item-label
              v-if="error.caption"
              caption
              :class="{ 'text-caption': mobileView, 'text-body2': !mobileView }"
            >
              {{ error.caption }}
            </q-item-label>
          </q-item-section>

          <q-item-section
            class="q-mt-sm"
            style="flex-direction: row; justify-content: flex-start"
          >
            <q-btn
              v-for="action in error.actions"
              :key="action.label"
              :size="itemSize"
              @click="action.handler"
            >
              {{ action.label }}
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>

      <q-card-actions align="right">
        <q-btn
          color="primary"
          label="OK"
          @click="onOKClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import type { QDialog } from 'quasar'
import { useDialogPluginComponent } from 'quasar'
import type { Ref } from 'vue'
import type { NotifyOptions } from 'src/classes/notifyOptions'
import { stateManager } from 'src/store/store-reader'
import { map } from 'rxjs'
import { useObservable } from '@vueuse/rxjs'

export default {
  emits: [...useDialogPluginComponent.emits],

  setup(): {
    errors: Ref<NotifyOptions[]>
    mobileView: Ref<boolean, boolean>
    itemSize: Ref<'sm' | 'md'>
    dialogRef: Ref<QDialog | undefined>
    onDialogHide: () => void
    onOKClick: (payload?: unknown) => void
  } {
    const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()
    const { mobileView$, errors$ } = stateManager

    const itemSize$ = mobileView$.pipe(
      map((mobileView) => {
        return mobileView ? 'sm' : 'md'
      }),
    )

    return {
      errors: useObservable(errors$),
      mobileView: useObservable(mobileView$),
      itemSize: useObservable(itemSize$),
      dialogRef,
      onDialogHide,
      onOKClick: onDialogOK,
    }
  },
}
</script>
