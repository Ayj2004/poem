<template>
  <div v-if="poem" class="poem-detail max-w-3xl mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4 text-center">{{ poem.title }}</h1>
    <div
      class="flex flex-wrap justify-center gap-4 text-gray-600 mb-6 border-b pb-4"
    >
      <span>【{{ poem.dynasty }}】{{ poem.poet }}</span>
      <span>格律：{{ poem.meter }}</span>
      <span>题材：{{ poem.theme }}</span>
      <span>录入时间：{{ poem.createTime }}</span>
      <span>更新时间：{{ poem.updateTime }}</span>
    </div>
    <img
      :src="poem.cover"
      :alt="poem.title"
      class="w-full h-64 object-cover rounded mb-6"
    />
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-3">原文</h3>
      <div
        class="text-lg leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded"
      >
        {{ poem.content }}
      </div>
    </div>
    <div>
      <h3 class="text-xl font-semibold mb-3">赏析</h3>
      <div class="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded">
        {{ poem.appreciation }}
      </div>
    </div>
  </div>
  <div v-else class="text-center py-10">诗歌不存在</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Poem } from "@/types";
import { usePoems } from "@/composables/usePoems";

// 修正 props 定义：id 为可选（兼容传入 poem 的场景），类型兼容 string/number
const props = defineProps<{
  id?: string | number;
  poem?: Poem;
}>();

const { getPoemById } = usePoems();
const poem = ref<Poem | null>(props.poem || null);

onMounted(() => {
  // 仅当未传入 poem 且传入 id 时，调用 getPoemById
  if (!poem.value && props.id) {
    const targetPoem = getPoemById(props.id);
    poem.value = targetPoem || null;
  }
});
</script>

<style scoped>
.poem-detail {
  line-height: 1.8;
}
.whitespace-pre-line {
  white-space: pre-line;
}
</style>
