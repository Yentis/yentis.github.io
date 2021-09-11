<template>
  <q-card
    :class="{
      'completed-container': manga.status === status.COMPLETED,
      'on-hold-container': manga.status === status.ON_HOLD,
      'plan-to-read-container': manga.status === status.PLAN_TO_READ,
      'dropped-container': manga.status === status.DROPPED,
      'read-container': manga.status === status.READING
    }"
  >
    <q-card-section
      class="manga-item q-pa-none"
      horizontal
    >
      <q-img
        contain
        class="manga-image q-my-sm q-ml-xs q-mr-sm"
        fit="scale-down"
        :src="manga.image"
      >
        <template #error>
          <q-icon
            class="full-width full-height"
            size="xl"
            name="image_not_supported"
          />
        </template>
      </q-img>

      <q-card-section
        class="full-width q-pl-none q-pt-sm q-pb-none q-pr-sm column"
      >
        <q-card-section
          horizontal
          class="text-h6"
        >
          <a
            :href="manga.url"
          >{{ manga.title }}</a>
        </q-card-section>

        <div>
          <div
            class="text-body2 manga-subtitle"
          >
            Progress:&nbsp; <a
              v-if="manga.readUrl"
              :href="manga.readUrl"
            >{{ manga.read }}</a>
            <span v-else>{{ manga.read }}</span>
          </div>

          <div
            v-if="manga.notes"
            class="text-body2 manga-subtitle"
          >
            Notes:&nbsp;&nbsp; <span>{{ manga.notes }}</span>
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

        <q-space />

        <q-card-section
          horizontal
          class="q-mb-sm"
        >
          <q-card-section
            class="q-pa-none"
          >
            <span
              class="status-text"
            >
              {{ manga.status }}
            </span>

            <div
              class="text-body2 end-self"
            >
              <q-icon
                class="q-mr-xs q-mb-xs"
                :name="statusIcon[manga.status]"
                size="xs"
              />
              <span>{{ siteNames[manga.site] }}</span>
            </div>
          </q-card-section>
        </q-card-section>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { Manga } from 'src/classes/manga'
import { SiteName } from 'src/enums/siteEnum'
import { Status, StatusIcon } from 'src/enums/statusEnum'

export default defineComponent({
  name: 'MangaItemSimple',

  props: {
    mangaJson: {
      type: String,
      required: true
    }
  },

  setup (props) {
    const manga = computed(() => {
      return JSON.parse(props.mangaJson) as Manga
    })

    return {
      manga,
      status: Status,
      siteNames: SiteName,
      statusIcon: StatusIcon
    }
  }
})
</script>

<style lang="scss" scoped src="./manga-item-simple.scss"></style>
