<template>
  <div class="mb-8 flex flex-wrap gap-2">
    <!-- 全部诗歌按钮（红棕色主色） -->
    <button
      class="px-4 py-2 rounded-md transition-colors duration-200"
      :style="{
        backgroundColor:
          activeTheme === 'all'
            ? '#8b4513' // 红棕色主色（替换原蓝色）
            : '#f9f2ed', // 浅红棕背景（替换原浅灰）
        color: activeTheme === 'all' ? '#ffffff' : '#5c371e', // 深棕文字
        border: activeTheme === 'all' ? 'none' : '1px solid #e8d8c8', // 红棕边框
      }"
      @click="handleSelectTheme('all')"
    >
      全部诗歌
    </button>

    <!-- 动态题材按钮（红棕色系内变化） -->
    <button
      v-for="theme in themes"
      :key="theme"
      class="px-4 py-2 rounded-md transition-colors duration-200"
      :style="{
        // 选中态：深棕；默认态：浅红棕背景
        backgroundColor:
          activeTheme === theme
            ? getThemeColor(theme, 'active')
            : getThemeColor(theme, 'default'),
        // 文字颜色适配背景
        color: activeTheme === theme ? '#ffffff' : '#5c371e',
        // hover态颜色（红棕色系过渡）
        '--hover-bg': getThemeColor(theme, 'hover'),
        border: activeTheme === theme ? 'none' : '1px solid #e8d8c8',
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
 * 基于题材名生成固定的红棕色系颜色（保持唯一性，仅在红棕色区间变化）
 * @param theme 题材名称
 * @param type 颜色类型（default/active/hover）
 * @returns 十六进制颜色值
 */
const getThemeColor = (
  theme: string,
  type: "default" | "active" | "hover"
): string => {
  // 基于题材名生成固定hash值（保证同一题材颜色不变）
  const hash = theme.split("").reduce((acc, char) => {
    acc = (acc << 5) - acc + char.charCodeAt(0);
    return acc & acc; // 转为32位整数
  }, 0);

  // 红棕色系色相区间（10-40度，涵盖砖红、焦糖棕、红棕）
  const baseHue = 20; // 基础红棕色色相
  const hueOffset = [0, 5, 10, 15, 20][Math.abs(hash) % 5]; // 小范围偏移，保证红棕基调
  const hue = baseHue + hueOffset; // 最终色相（20-40度）

  // 红棕色系的饱和度/亮度配置（核心调整）
  const colorConfig = {
    default: `hsl(${hue}, 30%, 95%)`, // 浅红棕背景（默认态）
    active: `hsl(${hue}, 70%, 40%)`, // 深红棕主色（选中态，降低亮度更沉稳）
    hover: `hsl(${hue}, 40%, 85%)`, // 红棕过渡色（hover态）
  };

  return colorConfig[type];
};

/**
 * 处理鼠标hover事件
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

// 显式暴露函数（消除TS6133报错）
defineExpose({
  handleSelectTheme,
  handleHover,
  getThemeColor,
});
</script>
