<template>
  <Layout title="编辑诗歌 | 云栈诗鉴">
    <div class="max-w-3xl mx-auto p-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-10">
        <span class="inline-block animate-spin mr-2">🔄</span>
        加载诗歌中...
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="text-center py-10 text-red-500">
        {{ error }}
      </div>

      <!-- 诗歌表单（仅加载完成后显示） -->
      <form v-if="poem" @submit.prevent="handleSubmit" class="mb-6">
        <h2 class="text-2xl font-bold mb-6">编辑诗歌</h2>

        <div class="mb-4">
          <label class="block text-gray-700 mb-2">诗歌标题</label>
          <input
            v-model="poemForm.title"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="请输入诗歌标题（如：静夜思）"
            required
          />
        </div>

        <!-- 诗人输入框 -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">诗人</label>
          <input
            v-model="poemForm.poet"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="请输入诗人姓名（如：李白）"
            required
          />
        </div>

        <!-- 朝代输入框 -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">朝代</label>
          <input
            v-model="poemForm.dynasty"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="请输入朝代（如：唐）"
            required
          />
        </div>

        <!-- 格律输入框 -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">格律</label>
          <input
            v-model="poemForm.meter"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="请输入格律（如：五言绝句）"
            required
          />
        </div>

        <!-- 题材输入框 -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">题材</label>
          <input
            v-model="poemForm.theme"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="请输入题材（如：思乡/边塞/田园）"
            required
          />
        </div>

        <!-- 封面预览 -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">封面图</label>
          <div class="flex items-center gap-4">
            <img
              :src="poemForm.cover"
              alt="诗歌封面"
              class="w-32 h-20 object-cover rounded border"
            />
            <button
              type="button"
              class="px-3 py-1 border rounded text-sm hover:bg-gray-100"
              @click="generateRandomCover"
            >
              换一张
            </button>
          </div>
        </div>

        <!-- 原文输入框 -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">诗歌原文</label>
          <textarea
            v-model="poemForm.content"
            class="w-full px-3 py-2 border rounded h-40"
            placeholder="请输入诗歌原文（分行用换行）"
            required
          ></textarea>
        </div>

        <!-- 赏析输入框 -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">诗歌赏析</label>
          <textarea
            v-model="poemForm.appreciation"
            class="w-full px-3 py-2 border rounded h-40"
            placeholder="请输入诗歌赏析"
            required
          ></textarea>
        </div>

        <div class="flex gap-4">
          <button
            type="submit"
            class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            保存修改
          </button>
          <router-link
            to="/"
            class="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            取消
          </router-link>
        </div>
      </form>

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
import { useRouter, useRoute } from "vue-router";
import type { Poem } from "@/types";
import Layout from "@/components/Layout.vue";
import { usePoems } from "@/composables/usePoems";

const router = useRouter();
const route = useRoute();
const poemId = route.params.id as string;

const { loading, error, fetchPoemById, updatePoem } = usePoems();
const poem = ref<Poem | null>(null);
const poemForm = ref<Partial<Poem>>({});

// 生成随机古风封面
const generateRandomCover = () => {
  const randomId = Math.floor(Math.random() * 1000);
  poemForm.value.cover = `https://picsum.photos/800/400?random=${randomId}&grayscale`;
};

// 加载诗歌数据
onMounted(async () => {
  if (poemId) {
    const result = await fetchPoemById(poemId);
    if (result.success && result.data) {
      poem.value = result.data;
      // 初始化表单数据
      poemForm.value = { ...result.data };
    } else {
      poem.value = null;
    }
  }
});

// 提交修改
const handleSubmit = async () => {
  if (
    !poemForm.value.title ||
    !poemForm.value.poet ||
    !poemForm.value.dynasty ||
    !poemForm.value.meter ||
    !poemForm.value.theme ||
    !poemForm.value.content ||
    !poemForm.value.appreciation
  ) {
    alert("标题、诗人、朝代、格律、题材、原文、赏析为必填项！");
    return;
  }

  // 补充必要字段
  poemForm.value.id = poemId;
  poemForm.value.updateTime = new Date().toLocaleString();

  const result = await updatePoem(poemForm.value as Poem);
  if (result.success) {
    alert("诗歌修改成功！");
    router.push({ name: "detail", params: { id: poemId } });
  } else {
    alert(`修改失败：${result.error}`);
  }
};
</script>
