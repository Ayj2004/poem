<template>
  <Layout title="首页 | 云栈诗鉴 - 简约轻量的 Vue 诗歌鉴赏系统">
    <div class="max-w-7xl mx-auto py-8 px-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-10">
        <span class="inline-block animate-spin mr-2">🔄</span>
        加载中...
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="text-center py-10 text-red-500">
        {{ error }}
      </div>

      <!-- 题材筛选 + 诗歌列表（仅加载完成后显示） -->
      <div v-if="!loading && !error">
        <!-- 题材筛选组件 -->
        <ThemeFilter
          :themes="allThemes"
          :active-theme="activeTheme"
          @change="handleThemeChange"
        />

        <!-- 诗歌列表 -->
        <div
          v-if="filteredPoems.length"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <router-link
            v-for="poem in filteredPoems"
            :key="poem.id"
            :to="{ name: 'detail', params: { id: poem.id } }"
            class="block"
          >
            <PoemCard :poem="poem" />
          </router-link>
        </div>

        <!-- 筛选后空状态 -->
        <div v-if="!filteredPoems.length" class="text-center py-10">
          <p class="text-gray-500 mb-4">
            {{
              activeTheme === "all"
                ? "暂无诗歌，快去创建吧～"
                : `暂无${activeTheme}题材的诗歌`
            }}
          </p>
          <CreatePoemBtn />
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import Layout from "@/components/Layout.vue";
import PoemCard from "@/components/PoemCard.vue";
import CreatePoemBtn from "@/components/CreatePoemBtn.vue";
import ThemeFilter from "@/components/ThemeFilter.vue"; // 题材筛选组件
import { usePoems } from "@/composables/usePoems";

const { poems, loading, error, fetchPoems } = usePoems();

// 页面挂载时加载诗歌列表
onMounted(() => {
  fetchPoems();
});

// 题材筛选相关状态
const activeTheme = ref<string>("all"); // 默认选中全部

// 提取所有不重复的题材（去重 + 过滤空值）
const allThemes = computed(() => {
  const themeSet = new Set(
    poems.value.map((poem) => poem.theme || "未分类").filter(Boolean)
  );
  return Array.from(themeSet);
});

// 根据选中的题材筛选诗歌
const filteredPoems = computed(() => {
  if (activeTheme.value === "all") {
    return poems.value; // 全部诗歌
  }
  // 筛选指定题材的诗歌（兼容未分类）
  return poems.value.filter((poem) => {
    const poemTheme = poem.theme || "未分类";
    return poemTheme === activeTheme.value;
  });
});

// 处理题材切换
const handleThemeChange = (theme: string) => {
  activeTheme.value = theme;
};
</script>
