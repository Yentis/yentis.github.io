<template>
  <q-card-actions
    vertical
    class="full-width"
  >
    <q-btn
      label="Test All"
      :loading="testing"
      @click="testAllSites"
    />

    <q-card-actions class="q-mt-sm q-pa-none">
      <q-btn-dropdown :label="`Site ${selectedSite}`">
        <q-list
          v-for="site in sortedSites"
          :key="site"
        >
          <q-item
            v-close-popup
            clickable
            @click="selectedSite = site"
          >
            <q-item-section>
              <q-item-label>{{ site }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-btn
        label="Test"
        :loading="testing"
        @click="testSite"
      />
    </q-card-actions>

    <p class="q-mt-sm q-mb-none message">
      {{ message }}
    </p>

    <q-btn
      label="Preview"
      @click="preview"
    />

    <MangaItem
      v-if="url"
      :url="url"
    />
  </q-card-actions>
</template>

<script lang="ts">
import type { Ref } from 'vue'
import { defineAsyncComponent, defineComponent, ref } from 'vue'
import testAll from '../services/testService'
import { SiteType } from '../enums/siteEnum'
import { testAsuraScans } from '../services/test/asurascans'
import { testLikeManga } from '../services/test/likemanga'
import { testHiperDEX } from '../services/test/hiperdex'
import { testMangaDex } from '../services/test/mangadex'
import { testMangago } from '../services/test/mangago'
import { testMangakakalot } from '../services/test/mangakakalot'
import { testWebtoons } from '../services/test/webtoons'
import { testFlameComics } from '../services/test/flamecomics'
import { useQuasar } from 'quasar'
import { LinkingSiteType } from '../enums/linkingSiteEnum'
import { testResetScans } from '../services/test/resetscans'
import { testKitsu } from '../services/test/kitsu'
import { testCubari } from '../services/test/cubari'
import { testTapas } from 'src/services/test/tapas'
import { testComikey } from 'src/services/test/comikey'
import { testTappytoon } from 'src/services/test/tappytoon'
import { testKagane } from 'src/services/test/kagane'
import { getSite } from 'src/services/siteService'

export default defineComponent({
  name: 'MangaTest',
  components: {
    MangaItem: defineAsyncComponent(() => import('../components/manga-item/MangaItem.vue')),
  },

  setup() {
    const $q = useQuasar()
    const testing = ref(false)
    const message = ref('')
    const url = ref('')

    let sortedSites: (SiteType | LinkingSiteType)[] = Object.values(SiteType)
    sortedSites = sortedSites
      .concat(Object.values(LinkingSiteType).filter((site) => !sortedSites.includes(site)))
      .sort()
    const selectedSite: Ref<SiteType | LinkingSiteType | undefined> = ref(sortedSites[0])

    const testAllSites = (): void => {
      testing.value = true
      message.value = ''

      testAll($q)
        .then((errors) => {
          if (errors.length === 0) {
            message.value = 'All tests passed!'
            return
          }

          let messageBuilder = ''
          errors.forEach((item, i) => {
            console.error(item.error)
            if (i > 0) messageBuilder += '\n\n'

            if (item.error instanceof Error) {
              messageBuilder += `${item.site}: ${item.error.message}`
              return
            }
            if (typeof item.error === 'string') {
              messageBuilder += `${item.site}: ${item.error}`
              return
            }

            messageBuilder += `${item.site}: See console`
          })

          message.value = messageBuilder
        })
        .catch((error) => {
          handleError(error)
        })
        .finally(() => {
          testing.value = false
        })
    }

    const preview = (): void => {
      const site = selectedSite.value
      if (site === undefined) return
      url.value = ''

      setTimeout(() => {
        url.value = getSite(site)?.getTestUrl() ?? ''
      }, 0)
    }

    const testSite = async (): Promise<void> => {
      switch (selectedSite.value) {
        case SiteType.AsuraScans:
          await doTest(testAsuraScans)
          break
        case SiteType.Comikey:
          await doTest(testComikey)
          break
        case SiteType.Cubari:
          await doTest(testCubari)
          break
        case SiteType.LikeManga:
          await doTest(testLikeManga)
          break
        case SiteType.FlameComics:
          await doTest(testFlameComics)
          break
        case SiteType.HiperDEX:
          await doTest(testHiperDEX)
          break
        case SiteType.Kagane:
          await doTest(testKagane)
          break
        case LinkingSiteType.Kitsu:
          await doTest(testKitsu($q))
          break
        case SiteType.MangaDex:
          await doTest(testMangaDex)
          break
        case SiteType.Mangago:
          await doTest(testMangago)
          break
        case SiteType.Mangakakalot:
          await doTest(testMangakakalot)
          break
        case SiteType.ResetScans:
          await doTest(testResetScans)
          break
        case SiteType.Tapas:
          await doTest(testTapas)
          break
        case SiteType.Tappytoon:
          await doTest(testTappytoon)
          break
        case SiteType.Webtoons:
          await doTest(testWebtoons)
          break
        case LinkingSiteType.MangaDex:
        case undefined:
          break
      }
    }

    const doTest = async (target: (() => Promise<void>) | Promise<void>): Promise<void> => {
      testing.value = true
      message.value = ''

      try {
        if (target instanceof Promise) {
          await target
        } else {
          await target()
        }
        message.value = 'All tests passed!'
      } catch (error) {
        handleError(error)
      } finally {
        testing.value = false
      }
    }

    const handleError = (error: unknown): void => {
      console.error(error)

      if (error instanceof Error) {
        message.value = error.message
        return
      }
      if (typeof error === 'string') {
        message.value = error
        return
      }

      message.value = 'See console'
    }

    return {
      sortedSites,
      testing,
      message,
      selectedSite,
      testAllSites,
      testSite,
      url,
      preview,
    }
  },
})
</script>

<style lang="scss" scoped>
.message {
  white-space: pre-line;
}
</style>
