<template>
  <q-card
    :class="{
      'completed-container': manga.status === status.COMPLETED,
      'on-hold-container': manga.status === status.ON_HOLD,
      'plan-to-read-container': manga.status === status.PLAN_TO_READ,
      'dropped-container': manga.status === status.DROPPED,
      'unread-container': isUnread,
      'read-container': manga.status === status.READING && !isUnread,
    }"
  >
    <q-card-section class="q-pa-none">
      <q-card-section
        class="manga-item q-pa-none"
        horizontal
      >
        <q-img
          contain
          class="manga-image q-ma-sm"
          fit="scale-down"
          :src="image"
        >
          <template #error>
            <div
              class="column full-width full-height"
              style="background: inherit"
            >
              <q-icon
                class="full-width col"
                size="xl"
                name="image_not_supported"
              />

              <q-btn
                class="col-3"
                color="button"
                text-color="button"
                icon="refresh"
                :size="itemSize"
                :loading="refreshing"
                @click="onRefreshRequested"
              />
            </div>
          </template>
        </q-img>

        <q-card-section class="full-width q-pl-none q-pt-sm q-pb-none q-pr-sm column">
          <q-card-section
            horizontal
            :class="{ 'text-subtitle2': mobileView, 'text-h6': !mobileView }"
          >
            <a
              :href="url"
              @click.prevent="navigate(url)"
              >{{ manga.title }}</a
            >

            <q-space />

            <q-btn
              v-if="editing"
              flat
              icon="close"
              :size="itemSize"
              @click="toggleEditing()"
            />
          </q-card-section>

          <div v-if="!editing">
            <div :class="{ 'text-caption': mobileView, 'text-body2': !mobileView, 'manga-subtitle': true }">
              Read:&nbsp;&nbsp;&nbsp;&nbsp;
              <router-link
                v-if="manga.readUrl?.startsWith('/')"
                :to="manga.readUrl"
              >
                {{ manga.read }}
              </router-link>
              <a
                v-else-if="manga.readUrl"
                :href="manga.readUrl"
                @click.prevent="navigate(manga.readUrl || '#')"
                >{{ manga.read }}</a
              >
              <span v-else>{{ manga.read }}</span>
            </div>

            <div :class="{ 'text-caption': mobileView, 'text-body2': !mobileView, 'manga-subtitle': true }">
              Current:
              <router-link
                v-if="manga.chapterUrl?.startsWith('/')"
                :to="manga.chapterUrl"
              >
                {{ manga.chapter }}
              </router-link>
              <a
                v-else-if="manga.chapterUrl"
                :href="manga.chapterUrl"
                @click.prevent="navigate(manga.chapterUrl)"
                >{{ manga.chapter }}</a
              >
              <span v-else>{{ manga.chapter }}</span>
            </div>

            <div
              v-if="manga.notes"
              :class="{ 'text-caption': mobileView, 'text-body2': !mobileView, 'manga-subtitle': true }"
            >
              Notes:&nbsp;&nbsp; <span>{{ manga.notes }}</span>
            </div>

            <div
              v-if="manga.chapterDate"
              :class="{ 'text-caption': mobileView, 'text-body2': !mobileView }"
            >
              {{ manga.chapterDate }}
            </div>

            <q-rating
              v-if="manga.rating"
              v-model="manga.rating"
              readonly
              size="1em"
              class="q-mt-sm"
              :max="10"
              :color="manga.rating > 6 ? 'positive' : manga.rating > 3 ? 'warning' : 'negative'"
            />
          </div>

          <div
            v-if="editing"
            style="max-width: 75%"
          >
            <q-input
              v-model="newReadNum"
              label="Read:"
              stack-label
              dense
              class="q-mb-sm"
            />

            <div :class="{ 'text-caption': mobileView, 'text-body2': !mobileView, 'manga-subtitle': true }">
              Current: <span>{{ manga.chapter }}</span>
            </div>

            <q-input
              v-model="newNotes"
              stack-label
              label="Notes:"
              class="q-mb-sm"
            />

            <q-card-actions class="q-px-none">
              <q-input
                v-model="newUrl"
                stack-label
                label="URL:"
                class="q-mb-sm"
                style="flex-grow: 1"
              />

              <q-btn
                color="button"
                text-color="button"
                class="q-ml-xs"
                padding="sm md"
                icon="search"
                :size="itemSize"
                @click="openSearchDialog()"
              />
            </q-card-actions>
          </div>

          <q-space />

          <q-card-section
            horizontal
            class="q-mb-sm"
          >
            <q-card-section class="q-pa-none">
              <q-card-section
                v-if="!editing"
                horizontal
                class="status-text"
              >
                <span>{{ isUnread ? 'New Chapter' : manga.status }}</span>
                <q-icon
                  v-if="isUnread"
                  class="q-ml-xs"
                  name="celebration"
                  size="xs"
                />
              </q-card-section>

              <div
                v-if="!editing"
                :class="{ 'text-caption': mobileView, 'text-body2': !mobileView, 'end-self': true }"
              >
                <q-icon
                  class="q-mr-xs q-mb-xs"
                  :name="statusIcon[manga.status]"
                  size="xs"
                />
                <span>{{ getSiteNameByUrl(manga.site) || 'Unknown site' }}</span>

                <q-icon
                  v-if="manga.shouldUpdate"
                  class="q-ml-xs center-self"
                  name="refresh"
                  color="positive"
                />
                <q-icon
                  class="q-ml-xs center-self"
                  :name="hasLinkedSites ? 'link' : 'link_off'"
                  :color="hasLinkedSites ? 'positive' : 'negative'"
                />
                <span
                  v-for="(id, site) in manga.linkedSites"
                  :key="site"
                  class="q-mx-xs"
                >
                  <q-img
                    class="q-ma-none q-pa-none"
                    height="1rem"
                    width="1rem"
                    :src="`https://icons.duckduckgo.com/ip2/${site}.ico`"
                  >
                    <template #error>
                      <q-icon
                        class="absolute-full full-height full-width"
                        name="image_not_supported"
                      />
                    </template>
                  </q-img>
                </span>
              </div>
            </q-card-section>

            <q-space />

            <q-card-section
              v-if="!editing"
              horizontal
              class="q-gutter-sm end-self"
            >
              <q-btn
                color="button"
                text-color="button"
                padding="sm md"
                icon="edit"
                :size="itemSize"
                @click="toggleEditing()"
              />

              <q-btn
                v-if="isUnread"
                color="unread"
                text-color="button"
                padding="sm md"
                icon="done"
                :size="itemSize"
                @click="readManga()"
              />
            </q-card-section>
          </q-card-section>
        </q-card-section>
      </q-card-section>
    </q-card-section>

    <q-card-section
      v-if="editing"
      horizontal
    >
      <q-card-actions
        align="left"
        vertical
      >
        <q-checkbox
          v-if="manga.status !== status.READING"
          v-model="newShouldUpdate"
          dense
          class="q-mb-xs"
          :size="itemSize"
          label="Check on refresh"
        />

        <q-btn-dropdown
          no-caps
          class="editing-box"
          :size="itemSize"
          :label="newStatus"
        >
          <q-list
            v-for="curStatus in Object.values(status)"
            :key="curStatus"
          >
            <q-item
              v-close-popup
              clickable
              class="center-items"
              @click="newStatus = curStatus"
            >
              <q-icon
                size="sm"
                class="q-mr-sm"
                :name="statusIcon[curStatus]"
              />
              <span class="full-width text-center">{{ curStatus }}</span>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-card-actions class="q-pa-none">
          <q-btn-dropdown
            no-caps
            class="editing-box q-mt-xs"
            :label="'Rating: ' + newRating"
            :size="itemSize"
          >
            <q-list
              v-for="index in 10"
              :key="index"
            >
              <q-item
                v-close-popup
                dense
                clickable
                @click="newRating = index"
              >
                <q-item-section>
                  <q-item-label>{{ index }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn
            v-if="newRating > 0"
            flat
            icon="close"
            :size="itemSize"
            @click="newRating = 0"
          />
        </q-card-actions>

        <q-btn
          no-caps
          class="editing-box q-mt-xs"
          label="Progress Linking"
          :size="itemSize"
          @click="openLinkingDialog()"
        />

        <q-btn
          no-caps
          class="editing-box"
          label="Alternate Sources"
          :size="itemSize"
          @click="openAltSourceDialog()"
        />
      </q-card-actions>

      <q-space />

      <q-card-actions vertical>
        <q-btn
          color="unread"
          text-color="button"
          padding="sm md"
          icon="save"
          :loading="saving"
          :size="itemSize"
          @click="saveManga()"
        />

        <q-space />

        <q-btn
          color="negative"
          text-color="button"
          padding="sm md"
          icon="delete"
          :size="itemSize"
          @click="deleteManga()"
        />
      </q-card-actions>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { Status, StatusIcon } from 'src/enums/statusEnum'
import { useMangaItem } from 'src/composables/useManga'
import useProgressLinking from '../../composables/useProgressLinking'
import useAltSources from '../../composables/useAltSources'
import useMangaList from '../../composables/useMangaList'
import useRefreshing from 'src/composables/useRefreshing'
import { isMangaRead } from 'src/services/sortService'
import { getSiteNameByUrl } from 'src/utils/siteUtils'
import { stateManager } from 'src/store/store-reader'
import { firstValueFrom, map } from 'rxjs'
import { useObservable } from '@vueuse/rxjs'
import { UrlNavigation } from 'src/classes/urlNavigation'
import { Manga } from 'src/classes/manga'
import { SiteType } from 'src/enums/siteEnum'

export default defineComponent({
  name: 'MangaItem',

  props: {
    url: {
      type: String,
      required: true,
    },
    initialEditing: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['mangaSaved', 'mangaRemoved'],

  setup(props, context) {
    const {
      observable: manga$,
      image,
      editing,
      saving,
      newUrl,
      newReadNum,
      newStatus,
      newNotes,
      newShouldUpdate,
      newRating,
      newLinkedSites,
      newSources,
      readManga,
      toggleEditing,
      saveManga,
      deleteManga,
    } = useMangaItem(props.url)

    const { openLinkingDialog } = useProgressLinking(manga$, newLinkedSites)
    const { openAltSourceDialog } = useAltSources(manga$, newSources)
    const { showUpdateMangaDialog } = useMangaList()
    const { refreshManga } = useRefreshing(ref(0))
    const { mobileView$, urlNavigation$ } = stateManager
    const refreshing = ref(false)

    const itemSize$ = mobileView$.pipe(
      map((mobileView) => {
        return mobileView ? 'sm' : 'md'
      }),
    )

    const hasLinkedSites$ = manga$.pipe(
      map((manga) => {
        return Object.keys(manga.linkedSites).length > 0
      }),
    )

    const isUnread$ = manga$.pipe(
      map((manga) => {
        return manga.status === Status.READING && !isMangaRead(manga)
      }),
    )

    const openSearchDialog = async (): Promise<void> => {
      const manga = await firstValueFrom(manga$)
      const url = await showUpdateMangaDialog(manga.title)
      if (url === undefined) return

      newUrl.value = url
    }

    const onRefreshRequested = (): void => {
      refreshing.value = true
      refreshManga(props.url)
        .finally(() => {
          refreshing.value = false
        })
        .catch(console.error)
    }

    if (props.initialEditing) {
      toggleEditing().catch(console.error)
    }

    return {
      status: Status,
      statusIcon: StatusIcon,
      editing,
      saving,
      refreshing,

      newUrl,
      newReadNum,
      newStatus,
      newNotes,
      newShouldUpdate,
      newRating,

      manga: useObservable(manga$, { initialValue: new Manga(props.url, SiteType.AsuraScans) }),
      image,

      mobileView: useObservable(mobileView$),
      itemSize: useObservable(itemSize$),
      navigate: (url: string): void => urlNavigation$.next(new UrlNavigation(url)),
      getSiteNameByUrl,

      hasLinkedSites: useObservable(hasLinkedSites$),
      openLinkingDialog,
      openAltSourceDialog,
      openSearchDialog,
      onRefreshRequested,

      isUnread: useObservable(isUnread$),
      deleteManga: (): void => {
        context.emit('mangaRemoved')
        deleteManga().catch(console.error)
      },
      readManga,
      toggleEditing,
      saveManga: (): void => {
        context.emit('mangaSaved')
        saveManga().catch(console.error)
      },
    }
  },
})
</script>

<style lang="scss" scoped src="./manga-item.scss"></style>
