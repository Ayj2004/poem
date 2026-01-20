/** 诗歌鉴赏类型 */
export interface Poem {
  id: string | number;
  title: string; // 标题
  poet: string; // 诗人
  dynasty: string; // 朝代
  theme: string; // 题材（边塞/田园/咏物等）
  meter: string; // 格律（五言绝句/七言律诗等）
  content: string; // 原文
  appreciation: string; // 赏析
  cover: string; // 封面图
  createTime: string; // 创建时间
  updateTime: string; // 更新时间
}

/** KV操作返回结果类型 */
export interface KVResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
