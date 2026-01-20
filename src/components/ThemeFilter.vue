<template>
  <div class="mb-8 flex flex-wrap gap-2">
    <!-- 全部诗歌按钮 -->
    <button
      class="px-4 py-2 rounded-md transition-colors duration-200"
      :style="{
        backgroundColor:
          activeTheme === 'all'
            ? '#165DFF' // 全部按钮固定主色
            : '#f5f5f5',
        color: activeTheme === 'all' ? '#ffffff' : '#333333',
        border: activeTheme === 'all' ? 'none' : '1px solid #e5e7eb',
      }"
      @click="handleSelectTheme('all')"
    >
      全部诗歌
    </button>

    <!-- 动态题材按钮（每个题材独立颜色） -->
    <button
      v-for="theme in themes"
      :key="theme"
      class="px-4 py-2 rounded-md transition-colors duration-200"
      :style="{
        // 选中态：深色主色；默认态：浅色背景
        backgroundColor:
          activeTheme === theme
            ? getThemeColor(theme, 'active')
            : getThemeColor(theme, 'default'),
        // 文字颜色适配背景
        color: activeTheme === theme ? '#ffffff' : '#333333',
        // hover态颜色（基于主色生成）
        '--hover-bg': getThemeColor(theme, 'hover'),
        border: activeTheme === theme ? 'none' : '1px solid #e5e7eb',
      }"
      @mouseenter="(e) => handleHover(e, 'enter')"
      @mouseleave="(e) => handleHover(e, 'leave', theme)"
      @click="handleSelectTheme(theme)"
    >
      {{ theme }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";

// 定义Props
const props = defineProps({
  themes: {
    type: Array as PropType<string[]>,
    required: true,
  },
  activeTheme: {
    type: String,
    required: true,
    default: "all",
  },
});

const { themes, activeTheme } = props;

// 定义事件
const emit = defineEmits<{
  (e: "change", theme: string): void;
}>();

// 处理题材选择
const handleSelectTheme = (theme: string) => {
  emit("change", theme);
};

/**
 * 基于题材名生成固定的唯一颜色（避免刷新后变色）
 * @param theme 题材名称
 * @param type 颜色类型（default/active/hover）
 * @returns 十六进制颜色值
 */
const getThemeColor = (
  theme: string,
  type: "default" | "active" | "hover"
): string => {
  // 基于题材名生成固定hash值（核心：保证同一题材颜色不变）
  const hash = theme.split("").reduce((acc, char) => {
    acc = (acc << 5) - acc + char.charCodeAt(0);
    return acc & acc; // 转为32位整数
  }, 0);

  // 生成固定色相（偏向古风色系：红/蓝/绿/棕）
  const hue = [0, 20, 120, 200, 280][Math.abs(hash) % 5];
  // 不同状态的饱和度/亮度配置
  const colorConfig = {
    default: `hsl(${hue}, 30%, 95%)`, // 浅色背景（默认态）
    active: `hsl(${hue}, 70%, 50%)`, // 深色主色（选中态）
    hover: `hsl(${hue}, 40%, 90%)`, // 过渡色（hover态）
  };

  return colorConfig[type];
};

/**
 * 处理鼠标hover事件（避免TS6133报错：显式关联模板调用）
 * @param e 鼠标事件
 * @param action 操作类型（enter/leave）
 * @param theme 题材名称
 */
const handleHover = (
  e: MouseEvent,
  action: "enter" | "leave",
  theme?: string
) => {
  const target = e.target as HTMLButtonElement;
  if (!target) return;

  if (action === "enter") {
    // 鼠标移入：使用hover色
    const hoverBg = window
      .getComputedStyle(target)
      .getPropertyValue("--hover-bg");
    target.style.backgroundColor = hoverBg;
  } else if (action === "leave" && theme) {
    // 鼠标移出：恢复默认/选中色
    target.style.backgroundColor =
      activeTheme === theme
        ? getThemeColor(theme, "active")
        : getThemeColor(theme, "default");
  }
};

// 显式暴露函数（关键：消除TS6133 "未使用" 报错）
defineExpose({
  handleSelectTheme,
  handleHover,
  getThemeColor,
});
</script>
