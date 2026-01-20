<template>
  <Layout title="AI 作诗 | 云栈诗鉴">
    <div class="max-w-3xl mx-auto p-4">
      <h2 class="text-2xl font-bold mb-6">AI 智能作诗</h2>

      <!-- AI 生成参数配置 -->
      <div
        class="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200"
      >
        <h3 class="text-lg font-semibold mb-4">生成参数</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- 题材选择 -->
          <div>
            <label class="block text-gray-700 mb-2">诗歌题材</label>
            <select
              v-model="form.theme"
              class="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">请选择题材</option>
              <option value="思乡">思乡</option>
              <option value="边塞">边塞</option>
              <option value="田园">田园</option>
              <option value="咏物">咏物</option>
              <option value="送别">送别</option>
              <option value="怀古">怀古</option>
            </select>
          </div>
          <!-- 格律选择 -->
          <div>
            <label class="block text-gray-700 mb-2">诗歌格律</label>
            <select
              v-model="form.meter"
              class="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">请选择格律</option>
              <option value="五言绝句">五言绝句</option>
              <option value="七言绝句">七言绝句</option>
              <option value="五言律诗">五言律诗</option>
              <option value="七言律诗">七言律诗</option>
            </select>
          </div>
        </div>
        <!-- 关键词输入 -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">核心关键词（可选）</label>
          <input
            v-model="form.keywords"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="如：明月、故乡、秋风（多个关键词用逗号分隔）"
          />
        </div>
        <!-- 生成按钮 -->
        <button
          @click="generatePoem"
          class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          :disabled="loading || !form.theme || !form.meter"
        >
          <span v-if="loading" class="inline-block animate-spin mr-2">🔄</span>
          {{ loading ? "生成中..." : "AI 生成诗歌" }}
        </button>
      </div>

      <!-- AI 生成结果编辑区 -->
      <div v-if="generatedPoem" class="mb-6">
        <h3 class="text-lg font-semibold mb-4">生成结果（可编辑）</h3>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">诗歌标题</label>
          <input
            v-model="generatedPoem.title"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="请输入诗歌标题"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">诗人（默认：AI 创作）</label>
          <input
            v-model="generatedPoem.poet"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="请输入诗人姓名"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">朝代（默认：未知）</label>
          <input
            v-model="generatedPoem.dynasty"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="请输入朝代"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">诗歌原文</label>
          <textarea
            v-model="generatedPoem.content"
            class="w-full px-3 py-2 border rounded h-40"
            placeholder="请输入诗歌原文（分行用换行）"
            required
          ></textarea>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">诗歌赏析（AI 生成）</label>
          <textarea
            v-model="generatedPoem.appreciation"
            class="w-full px-3 py-2 border rounded h-40"
            placeholder="请输入诗歌赏析"
            required
          ></textarea>
        </div>
        <!-- 封面预览 -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">封面图（古风随机生成）</label>
          <div class="flex items-center gap-4">
            <img
              :src="generatedPoem.cover"
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
        <!-- 保存按钮 -->
        <button
          @click="saveGeneratedPoem"
          class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          保存诗歌到系统
        </button>
      </div>

      <!-- 生成失败提示 -->
      <div
        v-if="error"
        class="mb-6 text-red-500 text-center py-4 bg-red-50 rounded"
      >
        {{ error }}
      </div>
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

// 生成参数表单
const form = ref({
  theme: "",
  meter: "",
  keywords: "",
});

// 状态管理
const loading = ref(false);
const error = ref("");
const generatedPoem = ref<Partial<Poem>>({
  title: "",
  poet: "AI 创作",
  dynasty: "未知",
  theme: "",
  meter: "",
  content: "",
  appreciation: "",
  cover: "",
  id: "",
  createTime: "",
  updateTime: "",
});

// 生成随机封面（复用创建页逻辑）
const generateRandomCover = () => {
  const randomId = Math.floor(Math.random() * 1000);
  generatedPoem.value.cover = `https://picsum.photos/800/400?random=${randomId}&grayscale`;
};

// 页面挂载时生成初始封面
onMounted(() => {
  generateRandomCover();
});

// 调用 Deepseek 接口生成诗歌（硬编码配置）
const generatePoem = async () => {
  loading.value = true;
  error.value = "";
  try {
    // 1. 构造请求参数
    const prompt = `请按照以下要求创作一首诗歌：
  - 题材：${form.value.theme}
  - 格律：${form.value.meter}
  - 核心关键词：${form.value.keywords || "无"}
  要求：
  1. 严格遵守所选格律的格式规范；
  2. 语言符合古风诗歌风格，避免现代词汇；
  3. 先输出诗歌标题，再输出诗歌原文（分行），最后输出200字左右的赏析。
  输出格式：
  标题：[标题]
  原文：
  [诗歌原文，分行展示]
  赏析：[赏析内容]`;

    // 2. 硬编码 Deepseek 接口配置（替换为你的实际密钥）
    const DEEPSEEK_API_KEY = "sk-4bd0f3d5192744f793d03eac12a299f4"; // 硬编码密钥
    const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"; // 硬编码接口地址

    // 3. 调用接口
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`, // 硬编码认证
      },
      body: JSON.stringify({
        model: "deepseek-chat", // 硬编码模型
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `接口请求失败：${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    const aiContent = result.choices[0]?.message?.content || "";
    if (!aiContent) {
      throw new Error("AI 未生成有效内容");
    }

    // 4. 解析 AI 生成结果
    const titleMatch = aiContent.match(/标题：(.*)/);
    const contentMatch = aiContent.match(/原文：\n([\s\S]*?)\n赏析：/);
    const appreciationMatch = aiContent.match(/赏析：([\s\S]*)/);

    // 5. 填充到编辑表单
    generatedPoem.value = {
      ...generatedPoem.value,
      title: titleMatch?.[1] || `${form.value.theme}·${form.value.meter}`,
      theme: form.value.theme,
      meter: form.value.meter,
      content: contentMatch?.[1] || "",
      appreciation: appreciationMatch?.[1] || "",
      id: Date.now().toString(),
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
    };
  } catch (e) {
    error.value = `生成失败：${(e as Error).message}`;
  } finally {
    loading.value = false;
  }
};

// 保存生成的诗歌到系统
const saveGeneratedPoem = async () => {
  if (
    !generatedPoem.value.title ||
    !generatedPoem.value.content ||
    !generatedPoem.value.appreciation
  ) {
    alert("标题、原文、赏析为必填项！");
    return;
  }

  // 兜底字段
  generatedPoem.value.poet = generatedPoem.value.poet || "AI 创作";
  generatedPoem.value.dynasty = generatedPoem.value.dynasty || "未知";
  generatedPoem.value.cover = generatedPoem.value.cover || "";

  // 调用保存接口
  const result = await savePoem(generatedPoem.value as Poem);
  if (result.success) {
    alert("诗歌保存成功！");
    router.push("/"); // 返回首页
  } else {
    alert(`保存失败：${result.error}`);
  }
};
</script>
