<template>
  <button
    class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
    @click="handleCreatePoem"
  >
    录入新诗歌
  </button>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

// 跳转至创建页面
const handleCreatePoem = () => {
  router.push({ name: "create" });
};
</script>
