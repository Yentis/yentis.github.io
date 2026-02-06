<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card>
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>{{ siteName }} Login</q-toolbar-title>
        <q-btn
          v-close-popup
          icon="close"
          flat
          round
          dense
        />
      </q-toolbar>

      <q-form @submit="onOKClick">
        <q-input
          v-model="username"
          filled
          label="Username"
        />

        <q-input
          v-model="password"
          filled
          type="password"
          label="Password"
        />

        <q-card-actions>
          <q-space />

          <q-btn
            label="Submit"
            type="submit"
            color="primary"
          />
          <q-btn
            v-close-popup
            label="Cancel"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import type { QDialog } from 'quasar'
import { useDialogPluginComponent } from 'quasar'
import type { Ref, UnwrapRef } from 'vue'
import { ref } from 'vue'

export default {
  props: {
    siteName: {
      required: true,
      type: String,
    },
  },

  emits: [...useDialogPluginComponent.emits],

  setup(): {
    dialogRef: Ref<QDialog | undefined>
    onDialogHide: () => void
    onOKClick: () => void
    onCancelClick: () => void
    username: Ref<UnwrapRef<string>, UnwrapRef<string>>
    password: Ref<UnwrapRef<string>, UnwrapRef<string>>
  } {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

    const username = ref('')
    const password = ref('')

    return {
      dialogRef,
      onDialogHide,
      onOKClick: (): void => {
        onDialogOK({ username: username.value, password: password.value })
      },
      onCancelClick: onDialogCancel,
      username,
      password,
    }
  },
}
</script>

<style lang="scss" scoped>
.confirmation-image-size {
  max-height: 256px;
}
</style>
