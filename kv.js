async function handleRequest(request) {
  try {
    // 统一提取响应头常量
    const DEFAULT_HEADERS = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    // URL 解析容错
    let url, pathname, method;
    try {
      url = new URL(request.url);
      pathname = url.pathname;
      method = request.method.toUpperCase();
    } catch (urlErr) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "请求 URL 格式非法，无法解析",
        }),
        {
          status: 400,
          headers: DEFAULT_HEADERS,
        }
      );
    }

    // 处理 OPTIONS 预检请求
    if (method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Accept",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 初始化 EdgeKV（验证模块是否可用）
    if (typeof EdgeKV === "undefined") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "EdgeKV 模块未加载，无法操作真实 KV 存储",
        }),
        {
          status: 500,
          headers: DEFAULT_HEADERS,
        }
      );
    }
    const edgeKV = new EdgeKV({ namespace: "kvpoem" });
    const getType = { type: "json" };

    // 1. 获取所有诗歌列表（真实 KV 读取）
    if (method === "GET" && pathname === "/api/poems") {
      // 读取 poem_list（替换原post_list）
      const poemList = (await edgeKV.get("poem_list", getType)) || [];

      // 验证 poemList 为数组
      if (!Array.isArray(poemList)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "poem_list 格式错误，预期为数组",
          }),
          {
            status: 500,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      // 批量读取单篇诗歌数据
      const poems = await Promise.all(
        poemList.map(async (id) => {
          if (!id) return null;
          const idStr = String(id);
          const poemKey = `poem_${idStr}`;
          const poem = await edgeKV.get(poemKey, getType);

          // 补充诗歌字段返回（适配诗歌鉴赏场景）
          return poem
            ? {
                id: idStr,
                title: poem.title || "无题",
                poet: poem.poet || "佚名", // 诗人（替换原author）
                dynasty: poem.dynasty || "未知朝代", // 新增：朝代
                theme: poem.theme || "未分类", // 题材（替换原category）
                meter: poem.meter || "未知格律", // 新增：格律（五言绝句/七言律诗等）
                content: poem.content || "", // 原文（替换原content）
                appreciation: poem.appreciation || "暂无赏析", // 新增：赏析
                cover:
                  poem.cover || "https://picsum.photos/1440/1080?grayscale", // 封面（适配古风）
                createTime: poem.createTime || "",
                updateTime: poem.updateTime || poem.createTime || "",
              }
            : null;
        })
      );

      const validPoems = poems.filter(Boolean);
      return new Response(
        JSON.stringify({
          success: true,
          data: validPoems,
        }),
        {
          headers: DEFAULT_HEADERS,
        }
      );
    }

    // 2. 获取单篇诗歌详情（真实 KV 读取）
    if (method === "GET" && pathname.startsWith("/api/poem/")) {
      const poemId = pathname.split("/").pop();
      if (!poemId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "诗歌ID不能为空",
          }),
          {
            status: 400,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      const poemIdStr = String(poemId);
      const poemKey = `poem_${poemIdStr}`;
      const poem = await edgeKV.get(poemKey, getType);

      if (!poem) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "诗歌不存在",
          }),
          {
            status: 404,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      // 补充诗歌字段兜底
      const poemWithDefault = {
        ...poem,
        poet: poem.poet || "佚名",
        dynasty: poem.dynasty || "未知朝代",
        theme: poem.theme || "未分类",
        meter: poem.meter || "未知格律",
        appreciation:
          poem.appreciation || poem.content.slice(0, 200) + "......",
      };

      return new Response(
        JSON.stringify({
          success: true,
          data: poemWithDefault,
        }),
        {
          headers: DEFAULT_HEADERS,
        }
      );
    }

    // 3. 新增/更新诗歌（真实 KV 写入）
    if (method === "POST" && pathname === "/api/poem") {
      const poemData = await request.json();
      // 校验核心字段（适配诗歌场景）
      if (
        !poemData.id ||
        !poemData.title ||
        !poemData.poet ||
        !poemData.content
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "诗歌ID、标题、诗人、原文不能为空",
          }),
          {
            status: 400,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      // 补全时间字段 + 诗歌字段兜底
      const now = new Date().toISOString();
      const poem = {
        ...poemData,
        id: String(poemData.id),
        updateTime: now,
        createTime: poemData.createTime || now,
        poet: poemData.poet || "佚名",
        dynasty: poemData.dynasty || "未知朝代",
        theme: poemData.theme || "未分类",
        meter: poemData.meter || "未知格律",
        appreciation: poemData.appreciation || "暂无赏析",
      };

      // 写入单篇诗歌数据
      const poemKey = `poem_${poem.id}`;
      await edgeKV.put(poemKey, JSON.stringify(poem));

      // 更新诗歌列表
      const poemList = (await edgeKV.get("poem_list", getType)) || [];
      if (!Array.isArray(poemList)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "poem_list 格式错误，预期为数组",
          }),
          {
            status: 500,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      if (!poemList.includes(poem.id)) {
        poemList.push(poem.id);
        await edgeKV.put("poem_list", JSON.stringify(poemList));
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: "诗歌保存成功（真实 KV 存储）",
        }),
        {
          headers: DEFAULT_HEADERS,
        }
      );
    }

    // 4. 删除诗歌（真实 KV 删除）
    if (method === "DELETE" && pathname.startsWith("/api/poem/")) {
      const poemId = pathname.split("/").pop();
      if (!poemId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "诗歌ID不能为空",
          }),
          {
            status: 400,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      const poemIdStr = String(poemId);
      const poemKey = `poem_${poemIdStr}`;

      // 删除单篇诗歌数据
      const deleteResult = await edgeKV.delete(poemKey);
      if (!deleteResult) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "诗歌删除失败",
          }),
          {
            status: 500,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      // 更新诗歌列表
      const poemList = (await edgeKV.get("poem_list", getType)) || [];
      if (!Array.isArray(poemList)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "poem_list 格式错误，预期为数组",
          }),
          {
            status: 500,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      const newPoemList = poemList.filter((id) => String(id) !== poemIdStr);
      await edgeKV.put("poem_list", JSON.stringify(newPoemList));

      return new Response(
        JSON.stringify({
          success: true,
          data: "诗歌删除成功（真实 KV 存储）",
        }),
        {
          headers: DEFAULT_HEADERS,
        }
      );
    }

    // 路由未匹配
    return new Response(
      JSON.stringify({
        success: false,
        error: "接口不存在",
      }),
      {
        status: 404,
        headers: DEFAULT_HEADERS,
      }
    );
  } catch (e) {
    // 异常处理
    const errorMsg = e.message || "未知操作异常";
    return new Response(
      JSON.stringify({
        success: false,
        error: `操作异常：${errorMsg}`,
      }),
      {
        status: 500,
        headers: DEFAULT_HEADERS,
      }
    );
  }
}

// 导出fetch处理函数
export default {
  async fetch(request) {
    return handleRequest(request);
  },
};
