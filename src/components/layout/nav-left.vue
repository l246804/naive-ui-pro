<script setup lang='tsx'>
import type { ProLayoutMode } from 'pro-naive-ui'
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useLayoutStore } from '@/store/use-layout-store'
import Breadcrumbs from './breadcrumbs.vue'

const {
  mode,
  mobile,
  showSidebar,
} = storeToRefs(useLayoutStore())

const showSidebarHiddenButton = computed(() => {
  const layoutMode = mode.value as ProLayoutMode
  if (mobile.value) {
    return false
  }
  return layoutMode !== 'horizontal'
})

const showBreadcrumbs = computed(() => {
  const layoutMode = mode.value as ProLayoutMode
  if (mobile.value) {
    return false
  }
  return layoutMode === 'vertical'
    || layoutMode === 'two-column'
    || layoutMode === 'sidebar'
})
</script>

<template>
  <div class="pl-8px flex items-center h-full gap-4px">
    <pro-button
      v-if="showSidebarHiddenButton"
      quaternary
      size="small"
      @click="showSidebar = !showSidebar"
    >
      <template #icon>
        <icon icon="line-md:menu" />
      </template>
    </pro-button>
    <breadcrumbs v-if="showBreadcrumbs" />
  </div>
</template>
