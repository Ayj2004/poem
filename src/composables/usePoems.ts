import { ref, computed } from "vue";
import type { Poem, KVResponse } from "@/types";

// 边缘函数地址（替换为你的实际地址）
const EDGE_FUNCTION_BASE_URL = "https://kvpome.4fa2a2a9.er.aliyun-esa.net";

export const usePoems = () => {
  const poems = ref<Poem[]>([]);
  const loading = ref(false);
  const error = ref("");

  // 根据ID查找本地诗歌
  const getPoemById = (id: string | number): Poem | undefined => {
    return poems.value.find((poem) => poem.id === id);
  };

  // 重置错误信息
  const resetError = () => {
    error.value = "";
  };

  // 1. 获取所有诗歌列表
  const fetchPoems = async (): Promise<KVResponse<Poem[]>> => {
    loading.value = true;
    resetError();
    try {
      const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/api/poems`);
      if (!response.ok) {
        throw new Error(`请求失败：${response.status} ${response.statusText}`);
      }
      const result: KVResponse<Poem[]> = await response.json();
      if (result.success) {
        // 兜底处理：确保列表中每个poem的字段有默认值
        poems.value = (result.data || []).map((poem) => ({
          ...poem,
          poet: poem.poet || "佚名",
          dynasty: poem.dynasty || "未知朝代",
          theme: poem.theme || "未分类",
          meter: poem.meter || "未知格律",
          appreciation: poem.appreciation || "暂无赏析",
        }));
        return { success: true, data: poems.value };
      } else {
        const errMsg = result.error || "获取诗歌列表失败";
        error.value = errMsg;
        return { success: false, error: errMsg };
      }
    } catch (e) {
      const errMsg = `网络异常：${(e as Error).message}`;
      error.value = errMsg;
      return { success: false, error: errMsg };
    } finally {
      loading.value = false;
    }
  };

  // 2. 获取单篇诗歌详情
  const fetchPoemById = async (id: string): Promise<KVResponse<Poem>> => {
    if (!id || typeof id !== "string") {
      const errMsg = "诗歌ID格式错误（必须为非空字符串）";
      error.value = errMsg;
      return { success: false, error: errMsg };
    }

    loading.value = true;
    resetError();
    try {
      const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/api/poem/${id}`);
      if (!response.ok) {
        throw new Error(`请求失败：${response.status} ${response.statusText}`);
      }
      const result: KVResponse<Poem> = await response.json();
      if (result.success) {
        const poem = result.data ?? undefined;
        return { success: true, data: poem };
      } else {
        const errMsg = result.error || "获取诗歌详情失败";
        error.value = errMsg;
        return { success: false, error: errMsg };
      }
    } catch (e) {
      const errMsg = `网络异常：${(e as Error).message}`;
      error.value = errMsg;
      return { success: false, error: errMsg };
    } finally {
      loading.value = false;
    }
  };

  // 3. 新增/更新诗歌（复用POST接口，后端已兼容更新逻辑）
  const savePoem = async (poem: Poem): Promise<KVResponse> => {
    const requiredFields = [
      "id",
      "title",
      "poet",
      "content",
      "createTime",
      "updateTime",
    ] as const;
    const emptyFields = requiredFields.filter((field) => !poem[field]);
    if (emptyFields.length > 0) {
      const errMsg = `诗歌必填字段为空：${emptyFields.join(", ")}`;
      error.value = errMsg;
      return { success: false, error: errMsg };
    }

    loading.value = true;
    resetError();
    try {
      const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/api/poem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(poem),
      });
      if (!response.ok) {
        throw new Error(`请求失败：${response.status} ${response.statusText}`);
      }
      const result: KVResponse = await response.json();
      if (result.success) {
        await fetchPoems(); // 重新拉取列表（确保最新数据）
        return { success: true };
      } else {
        const errMsg = result.error || "保存诗歌失败";
        error.value = errMsg;
        return { success: false, error: errMsg };
      }
    } catch (e) {
      const errMsg = `网络异常：${(e as Error).message}`;
      error.value = errMsg;
      return { success: false, error: errMsg };
    } finally {
      loading.value = false;
    }
  };

  // 3.1 单独的更新诗歌方法（语义化封装）
  const updatePoem = async (poem: Poem): Promise<KVResponse> => {
    // 强制更新updateTime
    poem.updateTime = new Date().toLocaleString();
    // 复用savePoem（后端POST接口已兼容更新逻辑）
    return await savePoem(poem);
  };

  // 4. 删除诗歌
  const deletePoem = async (id: string): Promise<KVResponse> => {
    if (!id || typeof id !== "string") {
      const errMsg = "诗歌ID格式错误（必须为非空字符串）";
      error.value = errMsg;
      return { success: false, error: errMsg };
    }

    loading.value = true;
    resetError();
    try {
      const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/api/poem/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`请求失败：${response.status} ${response.statusText}`);
      }
      const result: KVResponse = await response.json();
      if (result.success) {
        await fetchPoems(); // 重新拉取列表
        return { success: true };
      } else {
        const errMsg = result.error || "删除诗歌失败";
        error.value = errMsg;
        return { success: false, error: errMsg };
      }
    } catch (e) {
      const errMsg = `网络异常：${(e as Error).message}`;
      error.value = errMsg;
      return { success: false, error: errMsg };
    } finally {
      loading.value = false;
    }
  };

  // 诗歌数量
  const poemCount = computed(() => poems.value.length);

  // 重置状态
  const resetState = () => {
    poems.value = [];
    loading.value = false;
    error.value = "";
  };

  return {
    poems,
    loading,
    error,
    poemCount,
    fetchPoems,
    fetchPoemById,
    getPoemById,
    savePoem,
    updatePoem,
    deletePoem,
    resetState,
  };
};
