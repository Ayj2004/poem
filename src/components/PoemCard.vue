<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
  >
    <img :src="poem.cover" :alt="poem.title" class="w-full h-48 object-cover" />
    <div class="p-4">
      <div class="text-sm text-gray-500 mb-2 flex justify-between">
        <span>{{ poem.theme || "未分类" }}</span>
        <span>{{ poem.dynasty }}·{{ poem.poet }}</span>
      </div>
      <h3 class="text-xl font-bold mb-2 line-clamp-1">{{ poem.title }}</h3>
      <p class="text-gray-600 mb-4 line-clamp-3 whitespace-pre-line">
        {{ poem.content || "暂无原文" }}
      </p>
      <div class="flex justify-between items-center text-sm text-gray-500">
        <span>{{ poem.meter }}</span>
        <span>{{ poem.createTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Poem } from "@/types";

// 定义Props
defineProps<{
  poem: Poem;
}>();
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.whitespace-pre-line {
  white-space: pre-line;
}
</style>
