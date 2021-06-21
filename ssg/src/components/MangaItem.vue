<template>
  <q-card :class="{
    'completed-container': manga.status === status.COMPLETED,
    'on-hold-container': manga.status === status.ON_HOLD,
    'plan-to-read-container': manga.status === status.PLAN_TO_READ,
    'dropped-container': manga.status === status.DROPPED
  }">
    <q-card-section class="manga-item" horizontal>
      <q-img contain class="manga-image q-ma-sm" :src="image" @error="onImageError($event.target.src)">
        <template v-slot:error>
          <q-icon class="full-width full-height" size="xl" name="image_not_supported"></q-icon>
        </template>
      </q-img>

      <q-card-section class="q-pb-none q-pl-sm q-pr-none flex-column-between">
        <div class="q-mb-sm">
          <div class="text-h6">
            <a :href="manga.url">{{ manga.title }}</a>
          </div>

          <div class="text-body2 manga-subtitle">
            Progress: <a v-if="manga.readUrl" :href="manga.readUrl">{{ manga.read }}</a>
            <span v-else>{{ manga.read }}</span>
          </div>

          <div v-if="manga.notes" class="text-body2 manga-subtitle">
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

        <div class="text-body2">
          <q-icon
            class="q-mr-xs q-mb-xs"
            :name="statusIcon[manga.status]"
            size="xs"
          />
          <span>{{ siteName[manga.site] }}</span>
        </div>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { Manga } from 'src/classes/manga'
import { SiteName, SiteType } from 'src/enums/sites'
import { Status, StatusIcon } from 'src/enums/status'

export default defineComponent({
  name: 'manga-item',

  props: {
    mangaJson: {
      type: String,
      required: true
    }
  },

  computed: {
    manga (): Manga {
      const manga = JSON.parse(this.mangaJson) as Manga
      this.image = manga.image
      return manga
    },

    linkedSites (): Record<string, number> {
      return this.manga.linkedSites
    },

    hasLinkedSites (): boolean {
      return Object.keys(this.linkedSites).length > 0
    }
  },

  data () {
    return {
      status: Status,
      siteName: SiteName,
      statusIcon: StatusIcon,
      image: ''
    }
  },

  methods: {
    onImageError (src: string) {
      if (!this.linkedSites[SiteType.MangaDex]) return

      const baseUrl = `https://${SiteType.MangaDex}/images/manga/${this.linkedSites[SiteType.MangaDex]}`
      if (!src.includes(SiteType.MangaDex)) {
        this.image = `${baseUrl}.jpg`
      } else if (src.endsWith('jpg')) {
        this.image = `${baseUrl}.jpeg`
      } else if (src.endsWith('jpeg')) {
        this.image = `${baseUrl}.png`
      } else if (src.endsWith('png')) {
        this.image = `${baseUrl}.gif`
      }
    }
  }
})
</script>

<style lang="scss" scoped>
  .body--light {
    .completed-container {
      background-color: $green-3;
    }

    .on-hold-container {
      background-color: $lime-4;
    }

    .plan-to-read-container {
      background-color: $blue-11;
    }

    .dropped-container {
      background-color: $red-4;
    }
  }

  .body--dark {
    .completed-container {
      background-color: $teal-10;
    }

    .on-hold-container {
      background-color: $lime-10;
    }

    .plan-to-read-container {
      background-color: $blue-10;
    }

    .dropped-container {
      background-color: $brown-10;
    }
  }

  .manga-image {
    min-width: 96px;
    width: 96px;
  }
</style>
