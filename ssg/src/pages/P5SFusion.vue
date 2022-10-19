<template>
  <q-page>
    <q-select
      v-model="start"
      label="Start Persona"
      class="q-mt-sm q-px-sm"
      :options="Object.keys(PERSONAS)"
    />

    <q-select
      v-model="target"
      label="Target Persona"
      class="q-mt-sm q-px-sm"
      :options="Object.keys(PERSONAS)"
    />

    <q-btn
      class="q-mt-sm q-mx-sm"
      @click="onCalculate"
    >
      Calculate
    </q-btn>

    <p class="q-mt-sm q-mx-sm">
      {{ foundPath }}
    </p>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

const PERSONAS: Record<string, Array<string>> = {
  abaddon: ['kaiwan', 'neko shogun', 'cu chulainn', 'mithras', 'ganesha', 'yatagarasu', 'legion', 'bugs', 'black ooze', 'lilith', 'pisaca', 'mot'],
  alice: ['nebiros', 'lilith', 'bugs', 'dominion'],
  'ame-no-uzume': ['hua po', 'orthrus', 'lamia', 'slime', 'arsene', 'high pixie', 'berith'],
  andras: ['lilim', 'nebiros', 'succubus', 'silky', 'mokoi'],
  arahabaki: ['naga', 'kurama tengu', 'neko shogun', 'succubus', 'mothman', 'black ooze', 'setanta', 'eligor'],
  archangel: ['principality', 'dominion', 'metatron', 'orthrus', 'hua po', 'arsene', 'high pixie', 'jack-o-lantern', 'silky', 'andras'],
  arsene: ['high pixie', 'legion', 'bugs', 'black frost', 'jack-o-lantern'],
  berith: ['unicorn', 'forneus', 'high pixie', 'andras', 'mokoi'],
  bicorn: ['arahabaki', 'naga', 'kurama tengu', 'silky', 'jack-o-lantern', 'pixie'],
  'black frost': ['jack-o-lantern', 'king frost', 'jack frost'],
  'black ooze': ['lilith', 'mitra', 'jack-o-lantern', 'jack frost', 'andras', 'lilim'],
  bugs: ['pisaca', 'pixie', 'black frost', 'lilith'],
  cerberus: ['thor', 'yatagarasu'],
  'cu chulainn': ['lucifer', 'forneus', 'andras', 'lilim', 'nebiros', 'mokoi', 'pisaca', 'mot', 'legion', 'bugs', 'black ooze', 'lilith'],
  dominion: ['metatron', 'king frost', 'berith', 'unicorn', 'forneus', 'mokoi', 'pisaca', 'mot'],
  eligor: ['okuninushi', 'king frost', 'mitra', 'pixie', 'ame-no-uzume', 'andras', 'lilim', 'berith', 'slime', 'lamia'],
  forneus: ['succubus', 'mothman', 'black ooze', 'lilith', 'bicorn', 'arahabaki', 'naga', 'kurama tengu'],
  fortuna: ['norn', 'raja naga', 'valkyrie', 'mithras'],
  ganesha: ['yatagarasu', 'sarasvati', 'jack-o-lantern', 'jack frost', 'queen mab', 'setanta', 'eligor', 'okuninushi'],
  hecatoncheires: ['berith', 'unicorn', 'mitra', 'koppa tengu', 'mothman', 'black ooze', 'bicorn', 'arahabaki'],
  'high pixie': ['legion', 'bugs', 'black frost', 'archangel', 'succubus', 'slime'],
  'hua po': ['orthrus', 'hecatoncheires', 'berith', 'andras', 'succubus', 'jack-o-lantern', 'pixie'],
  'jack-o-lantern': ['jack frost', 'queen mab', 'pixie'],
  'jack frost': ['queen mab', 'lilim', 'lamia', 'arsene', 'high pixie'],
  kaiwan: ['neko shogun', 'cu chulainn', 'lucifer', 'eligor', 'setanta', 'archangel', 'principality'],
  kali: ['slime', 'shiisaa', 'cerberus', 'berith', 'unicorn', 'forneus'],
  'kikuri-hime': ['sarasvati', 'mithras', 'kaiwan', 'neko shogun', 'bicorn', 'arahabaki'],
  'king frost': ['jack-o-lantern', 'jack frost'],
  'koppa tengu': ['raja naga', 'kikuri-hime', 'bicorn', 'arahabaki', 'kaiwan'],
  'kurama tengu': ['jack-o-lantern', 'jack frost', 'queen mab', 'kaiwan', 'neko shogun', 'mitra', 'koppa tengu'],
  lamia: ['kali', 'archangel', 'hua po', 'slime'],
  legion: ['bugs', 'black frost', 'shiisaa', 'kaiwan', 'setanta'],
  lilim: ['nebiros', 'setanta', 'hua po', 'orthrus', 'mokoi', 'pisaca'],
  lilith: ['fortuna', 'hua po', 'hecatoncheires'],
  lucifer: ['black frost', 'mara', 'metatron', 'alice', 'yoshitsune'],
  mara: ['yoshitsune', 'alice'],
  metatron: ['archangel', 'principality', 'trumpeter', 'dominion'],
  mitra: ['koppa tengu', 'raja naga', 'legion', 'setanta', 'eligor', 'archangel', 'principality', 'jack-o-lantern', 'jack frost', 'andras', 'lilim', 'succubus', 'mothman'],
  mithras: ['ganesha', 'yatagarasu', 'okuninushi', 'mitra', 'slime', 'shiisaa', 'jack-o-lantern', 'jack frost', 'kaiwan', 'archangel', 'principality'],
  mokoi: ['pisaca', 'mot', 'alice', 'andras', 'bicorn', 'jack-o-lantern'],
  mot: ['alice', 'cerberus', 'arsene', 'high pixie', 'legion', 'bugs', 'fortuna', 'norn'],
  mothman: ['black ooze', 'lilith', 'kaiwan', 'andras', 'lilim', 'hua po', 'orthrus'],
  naga: ['kurama tengu', 'valkyrie', 'mitra', 'koppa tengu', 'silky', 'kikuri-hime'],
  nebiros: ['silky', 'kikuri-hime', 'sarasvati', 'mitra', 'koppa tengu', 'raja naga'],
  'neko shogun': ['cu chulainn', 'lucifer', 'unicorn', 'mitra', 'succubus', 'mothman'],
  norn: ['mitra', 'koppa tengu', 'raja naga', 'mithras', 'ganesha'],
  okuninushi: ['king frost', 'queen mab', 'kaiwan', 'neko shogun', 'arsene', 'high pixie', 'legion'],
  orthrus: ['hecatoncheires', 'pisaca', 'berith', 'arsene', 'high pixie'],
  pisaca: ['mot', 'alice', 'ame-no-uzume', 'archangel', 'slime'],
  pixie: ['ame-no-uzume', 'bicorn'],
  principality: ['dominion', 'metatron', 'mothman', 'mokoi', 'pisaca', 'pixie', 'ame-no-uzume'],
  'queen mab': ['silky', 'kikuri-hime', 'kaiwan', 'neko shogun', 'mitra', 'koppa tengu', 'eligor', 'okuninushi'],
  'raja naga': ['bicorn', 'arahabaki', 'naga', 'hua po', 'orthrus', 'hecatoncheires'],
  sarasvati: ['valkyrie', 'bicorn', 'arahabaki', 'naga'],
  setanta: ['eligor', 'okuninushi', 'king frost', 'principality', 'jack-o-lantern', 'jack frost', 'archangel'],
  seth: ['mara', 'yoshitsune', 'kurama tengu'],
  shiisaa: ['cerberus', 'thor', 'arahabaki', 'succubus', 'mothman', 'jack-o-lantern', 'jack frost'],
  siegfried: ['seth', 'thor'],
  silky: ['kikuri-hime', 'sarasvati', 'mokoi', 'pixie', 'bicorn'],
  slime: ['shiisaa', 'cerberus', 'thor', 'hua po', 'mokoi', 'bicorn'],
  succubus: ['mothman', 'black ooze', 'lilith', 'slime', 'arsene', 'silky'],
  thor: ['trumpeter', 'andras', 'lilim', 'nebiros', 'valkyrie', 'mithras', 'ganesha', 'fortuna'],
  trumpeter: ['abaddon', 'mot', 'fortuna', 'norn', 'silky', 'kikuri-hime', 'sarasvati', 'arahabaki', 'naga', 'valkyrie'],
  unicorn: ['forneus', 'koppa tengu', 'slime', 'shiisaa', 'succubus', 'mothman', 'black ooze', 'bicorn', 'arahabaki', 'high pixie', 'legion'],
  valkyrie: ['siegfried', 'hecatoncheires', 'mithras', 'berith', 'unicorn'],
  yatagarasu: ['bicorn', 'arahabaki', 'naga', 'kurama tengu', 'seth'],
  yoshitsune: ['siegfried', 'arahabaki', 'okuninushi', 'yatagarasu']
}

export default defineComponent({
  name: 'PageP5SFusion',

  setup () {
    const start = ref('')
    const target = ref('')
    const foundPath = ref('')
    let lowestLength = 10

    const onCalculate = () => {
      if (!start.value || !target.value) {
        foundPath.value = 'Start & Target Persona must be filled'
        return
      }

      const startPersona = start.value.toLowerCase()
      const targetPersona = target.value.toLowerCase()

      foundPath.value = ''
      lowestLength = 10

      const targetSources = PERSONAS[targetPersona]
      if (targetSources === undefined) {
        foundPath.value = 'Target Persona not found'
        return
      }

      if (PERSONAS[startPersona] === undefined) {
        foundPath.value = 'Start Persona not found'
        return
      }

      checkTarget(startPersona, targetSources, targetPersona)
      if (foundPath.value === '') foundPath.value = 'No fusion path found'
    }

    const checkTarget = (target: string, sources: Array<string>, path: string, depth = 0): string | null => {
      if (depth >= lowestLength) return null
      if (sources.includes(target)) return path

      for (const source of sources) {
        const newSources = PERSONAS[source]
        if (newSources === undefined) continue

        const match = checkTarget(target, newSources, path + ' - ' + source, depth + 1)
        if (match) {
          const length = match.split('-').length

          if (length < lowestLength) {
            foundPath.value = match
            lowestLength = length
          }
        }
      }

      return null
    }

    return {
      start,
      target,
      foundPath,
      onCalculate,
      PERSONAS
    }
  }
})
</script>

<style scoped>
  .intersection-item {
    height: 280px;
    min-width: 155px;
  }

  .image {
    height: 200px;
    width: auto;
    margin-left: auto;
    margin-right: auto;
  }
</style>
