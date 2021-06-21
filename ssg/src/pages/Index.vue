<template>
  <q-page>
    <iframe
      allowfullscreen
      frameborder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      src="https://www.youtube.com/embed/Y5tjtUFL0j4?controls=0?&autoplay=1&amp;start=44"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'PageIndex'
})
</script>

<style scoped>
  iframe {
    width: 100%;
    height: 100%;
    position: absolute;
  }
</style>
