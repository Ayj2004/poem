<template>
  <Layout :title="poem?.title || '诗歌详情 | 云栈诗鉴'">
    <div class="max-w-3xl mx-auto py-8 px-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-10">
        <span class="inline-block animate-spin mr-2">🔄</span>
        加载中...
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="text-center py-10 text-red-500">
        {{ error }}
      </div>

      <!-- 诗歌操作区 -->
      <div v-if="poem" class="mb-6 flex gap-4">
        <router-link
          :to="{ name: 'edit', params: { id: poem.id } }"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          编辑诗歌
        </router-link>
        <button
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          @click="handleDelete"
        >
          删除诗歌
        </button>
      </div>

      <!-- 诗歌详情 -->
      <PoemDetail v-if="poem" :id="poem.id" :poem="poem" />

      <!-- 诗歌不存在 -->
      <div v-if="!loading && !error && !poem" class="text-center py-10">
        <p class="text-gray-500">该诗歌不存在或已被删除</p>
        <router-link
          to="/"
          class="text-primary mt-4 inline-block hover:underline"
        >
          返回首页
        </router-link>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Poem } from "@/types";
import Layout from "@/components/Layout.vue";
import PoemDetail from "@/components/PoemDetail.vue";
import { usePoems } from "@/composables/usePoems";

// 获取路由参数
const route = useRoute();
const router = useRouter();
const poemId = ref<string | number>(route.params.id as string);

const { loading, error, fetchPoemById, deletePoem } = usePoems();
const poem = ref<Poem | null>(null);

// 加载诗歌详情
onMounted(async () => {
  if (poemId.value) {
    const result = await fetchPoemById(poemId.value as string);
    if (result.success && result.data) {
      poem.value = result.data;
    } else {
      poem.value = null;
    }
  }
});

// 处理删除逻辑
const handleDelete = async () => {
  if (!confirm("确定要删除这首诗歌吗？删除后无法恢复！")) {
    return;
  }

  const result = await deletePoem(poemId.value as string);
  if (result.success) {
    alert("诗歌删除成功！");
    router.push("/");
  } else {
    alert(`删除失败：${result.error}`);
  }
};
</script>
