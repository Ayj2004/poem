<template>
  <Layout title="创建诗歌 | 云栈诗鉴">
    <div class="max-w-3xl mx-auto p-4">
      <h2 class="text-2xl font-bold mb-6">录入新诗歌</h2>
      <!-- 诗歌表单 -->
      <form @submit.prevent="handleSubmit">
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

        <!-- 封面预览（无需手动输入） -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">封面图（古风随机生成）</label>
          <div class="flex items-center gap-4">
            <img
              :src="poemForm.cover"
              alt="古风封面"
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

        <button
          type="submit"
          class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          保存诗歌
        </button>
      </form>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { Poem } from "@/types";
import Layout from "@/components/Layout.vue";
import { usePoems } from "@/composables/usePoems";

const router = useRouter();
const { savePoem } = usePoems();

// 生成随机古风封面图
const generateRandomCover = () => {
  // 使用picsum.photos生成灰度古风图
  const randomId = Math.floor(Math.random() * 1000);
  poemForm.value.cover = `https://picsum.photos/800/400?random=${randomId}&grayscale`;
};

// 表单数据
const poemForm = ref<Partial<Poem>>({
  id: Date.now().toString(), // 临时用时间戳生成ID
  title: "",
  poet: "",
  dynasty: "",
  meter: "",
  theme: "",
  cover: "", // 初始为空，挂载后自动生成
  content: "",
  appreciation: "",
  createTime: new Date().toLocaleString(),
  updateTime: new Date().toLocaleString(),
});

// 页面挂载时自动生成随机封面
onMounted(() => {
  generateRandomCover();
});

// 提交表单
const handleSubmit = async () => {
  // 校验必填项
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

  // 兜底：防止字段未定义导致展示异常
  poemForm.value.poet = poemForm.value.poet || "佚名";
  poemForm.value.dynasty = poemForm.value.dynasty || "未知朝代";
  poemForm.value.theme = poemForm.value.theme || "未分类";
  poemForm.value.meter = poemForm.value.meter || "未知格律";

  // 调用保存接口
  const result = await savePoem(poemForm.value as Poem);
  if (result.success) {
    alert("诗歌录入成功！");
    router.push("/"); // 返回首页
  } else {
    alert(`录入失败：${result.error}`);
  }
};
</script>
