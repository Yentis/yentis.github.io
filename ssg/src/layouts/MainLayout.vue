<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      elevated
      class="bg-grey-7"
    >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <span class="text-center full-width text-h5">{{ $route.name }}</span>

        <q-btn
          flat
          dense
          round
          icon="settings_brightness"
          aria-label="Dark Mode"
          @click="updateDarkMode"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      behavior="mobile"
    >
      <q-list>
        <q-item-label header>
          Pages
        </q-item-label>

        <Navigation
          v-for="link in pages"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container style="height: 100%">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import Navigation from 'components/Navigation.vue'
import { useQuasar } from 'quasar'

const pagesData = [
  {
    title: 'Emote List',
    icon: 'sentiment_satisfied_alt',
    link: 'https://yentis.github.io/emotes'
  },
  {
    title: 'Manga List',
    icon: 'list',
    link: 'https://yentis.github.io/mangalist?id=2059191'
  },
  {
    title: 'Manga Reader',
    icon: 'library_books',
    link: 'https://yentis.github.io/mangareader'
  },
  {
    title: 'Mudae Visualizer',
    icon: 'calculate',
    link: 'https://yentis.github.io/mudae'
  }
]

import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'MainLayout',
  components: { Navigation },

  setup () {
    const $q = useQuasar()
    const darkModeEnabled = ref(false)
    const leftDrawerOpen = ref(false)

    onMounted(() => {
      const storedDarkMode: boolean = localStorage.getItem('dark_mode') === 'true' || false
      darkModeEnabled.value = storedDarkMode

      $q.dark.set(darkModeEnabled.value)
    })

    const updateDarkMode = () => {
      darkModeEnabled.value = !darkModeEnabled.value
      $q.dark.set(darkModeEnabled.value)
      localStorage.setItem('dark_mode', darkModeEnabled.value.toString())
    }

    return {
      leftDrawerOpen,
      darkModeEnabled,
      pages: pagesData,
      updateDarkMode
    }
  }
})
</script>
