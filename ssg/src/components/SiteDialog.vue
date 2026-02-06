<template>
  <q-dialog
    ref="dialogRef"
    no-focus
    no-refocus
    seamless
    :hidden="!visible || (mobileView && searchResults.length !== 0)"
    :position="mobileView ? 'bottom' : 'right'"
    @hide="onDialogHide"
  >
    <q-card :class="{ 'mobile-site-dialog': mobileView }">
      <q-toolbar class="bg-primary text-white text-center q-pl-xs">
        <q-btn
          flat
          round
          icon="refresh"
          :loading="refreshing"
          @click="refreshSites"
        />
        <q-toolbar-title class="q-pl-xs"> Supported sites </q-toolbar-title>
      </q-toolbar>
      <q-card-section class="q-pa-none">
        <q-list
          separator
          :class="{ 'text-center': mobileView }"
        >
          <q-item
            v-for="item in siteList"
            :key="item.site.siteType"
            clickable
            :class="{
              'bg-negative': !item.site.statusOK() && item.site.state === siteState.OFFLINE,
              'bg-warning': !item.site.statusOK() && item.site.state !== siteState.OFFLINE,
              'text-black': !item.site.statusOK(),
            }"
            @click="
              item.site.loggedIn
                ? item.site.statusOK()
                  ? navigate(item.site.getUrl())
                  : navigate(item.site.getUrl(), true)
                : navigate(item.site.getLoginUrl(), true)
            "
          >
            <q-item-section v-if="!item.refreshing">
              <q-item-label :class="{ 'full-width': mobileView }">
                {{ getSiteNameByUrl(item.site.siteType) || 'Unknown site' }}
              </q-item-label>
              <q-item-label
                :class="{
                  'text-black': !item.site.statusOK() && $q.dark.isActive,
                  'text-warning': item.site.statusOK(),
                }"
                caption
              >
                {{
                  !item.site.loggedIn
                    ? 'Click to login'
                    : !item.site.statusOK()
                      ? item.site.state
                      : !item.site.hasSearch()
                        ? 'Search not supported'
                        : ''
                }}
              </q-item-label>
            </q-item-section>

            <q-inner-loading :showing="item.refreshing">
              <q-spinner-dots
                size="md"
                color="primary"
              />
            </q-inner-loading>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { defineComponent } from 'vue'
import { SiteState } from '../enums/siteEnum'
import useSiteList from '../composables/useSiteList'
import useSiteListVisible from '../composables/useSiteListVisible'
import { getSiteNameByUrl } from '../utils/siteUtils'
import { stateManager } from 'src/store/store-reader'
import { useObservable } from '@vueuse/rxjs'
import { UrlNavigation } from 'src/classes/urlNavigation'

export default defineComponent({
  props: {
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },

  emits: [...useDialogPluginComponent.emits],

  setup() {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
    const { siteList, refreshing, refreshSites } = useSiteList()
    const { visible } = useSiteListVisible()
    const { mobileView$, searchResults$, urlNavigation$ } = stateManager

    return {
      dialogRef,
      onDialogHide,
      onOKClick: onDialogOK,
      onCancelClick: onDialogCancel,
      siteState: SiteState,
      siteList,
      mobileView: useObservable(mobileView$),
      visible,
      refreshing,
      refreshSites,
      searchResults: useObservable(searchResults$, { initialValue: [] }),
      navigate: (url: string, openInApp?: boolean): void => urlNavigation$.next(new UrlNavigation(url, openInApp)),
      getSiteNameByUrl,
    }
  },
})
</script>

<style lang="scss" scoped>
.mobile-site-dialog {
  height: 25vh;
  min-height: 25vh;
}
</style>
