<script setup>
defineProps({
  theme: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <button
    type="button"
    class="theme-toggle pixel"
    aria-label="Переключить светлую и тёмную тему"
    title="Тема по настройкам устройства"
    :aria-pressed="theme === 'light'"
    @click="emit('toggle')"
  >
    {{ theme === 'light' ? '☾' : '☼' }} <span>ТЕМА</span>
  </button>
</template>
