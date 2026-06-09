---

title: MatchTable — UI 设计

version: MVP v1.0

scope: design

related:

  - docs/prd/04-feature-profile.md

  - docs/prd/05-feature-discover.md

  - docs/prd/10-architecture.md

---



# UI 设计规范



## 设计方向



**Editorial Luxury**



---



## 关键词



- Editorial

- Luxury

- Premium

- Magazine

- Minimal

- Light

- Elegant



---



## 禁止风格



- Pink dating site aesthetic（粉色婚恋风）

- Matchmaker / red-introduction style（红娘风）

- Excessive hearts / romantic clichés（爱心泛滥）

- Traditional blind-date website look（传统相亲网站风格）



---



## 视觉参考



参考产品：



- Linear

- Raycast

- Stripe

- Notion



上述产品均以**浅色界面为默认**，同时保留可选深色模式；MatchTable 遵循相同策略。



---



## 品牌核心视觉：Table Card



所有用户资料均以 **Table Card** 组件作为核心品牌视觉。



布局示例：



```txt

┌────────────┐

│ MatchTable │

├────────────┤

│ Age 28     │

│ Height 180 │

│ City Shanghai │

└────────────┘

```



该结构化卡片格式在以下场景形成统一的产品记忆点：



- 发现广场列表

- 用户详情页

- 收藏列表

- 资料预览

- 资料对比页



---



## Compare Table（资料对比表）



对比页核心组件，延续 Table Card 的结构化表格品牌，参考传统相亲资料对照表：



```txt

┌──────────┬──────────┬──────────┬──────────┐

│ 对比项   │ 我（固定）│ 用户 A   │ 用户 B   │

├──────────┼──────────┼──────────┼──────────┤

│ 年龄     │ 28       │ 26       │ 30       │

│ 身高体重 │ 180/70   │ 165/52   │ 175/68   │

│ 学历     │ 本科     │ 硕士     │ 本科     │

│ ...      │ ...      │ ...      │ ...      │

└──────────┴──────────┴──────────┴──────────┘

```



### 布局规则



| 区域 | 行为 |
|------|------|
| **对比项列（第 1 列）** | 行标签；`position: sticky; left: 0`；浅色背景 + 右侧分隔线 |
| **固定我的信息列（可选）** | 用户开启后插入为第 2 列；`position: sticky; left: [对比项列宽]`；滚动时始终可见 |
| **其他资料列** | 横向排列；容器 `overflow-x: auto`；Mobile First 支持触控滑动 |
| **表头行** | 每列资料列显示昵称 + 主图缩略图；对比项列左上角留空或显示「对比项」 |



### 视觉风格



- 浅色默认：白底、细灰网格线（`border`），左对齐文本
- 与 Editorial Luxury 一致：留白充足、字体层级清晰，避免粉色婚恋元素
- 空值统一 `—`；长文本截断 + 展开，避免撑破行高
- 使用 **CSS Modules** 实现 sticky 列与滚动容器，禁止 Tailwind



### 组件文件建议



```txt

CompareTable/
├── CompareTable.tsx
├── CompareTable.module.css
├── CompareTableRow.tsx
└── CompareTableHeader.tsx
```



---



## 主题与配色



- **Light mode default**（默认浅色模式）

- 深色模式作为**可选切换**（用户偏好或系统设置），非默认

- 浅色主题下保持 Editorial Luxury 调性：高对比排版、留白、精致边框与阴影，避免粉色婚恋或红娘风



---



## 样式方案



**必须使用：**



- **CSS Modules** — 组件级样式（`.module.css`），设计 token 通过 CSS 自定义属性（`:root` / `[data-theme="dark"]`）管理

- **shadcn/ui** — 组件结构与交互模式；样式须改写为 CSS Modules，**不得**依赖 Tailwind 工具类

- **Radix UI** — 无样式原语（Dialog、Dropdown、Tabs 等），由 CSS Modules 完成视觉层



**禁止使用：**



- TailwindCSS（含 v3 / v4）

- 全局 utility-first CSS 框架



### shadcn/ui 与 CSS Modules 协作



shadcn/ui 官方模板基于 Tailwind；在本项目中：



1. 复用 shadcn 的 **Radix 封装逻辑**与 **组件 API**（props、组合模式）

2. 将 Tailwind 类替换为对应 **CSS Module 类名**

3. 设计 token（颜色、间距、圆角、字体）统一定义在全局 CSS 变量中，供 Modules 引用

4. 新增组件遵循同一模式：`Component.tsx` + `Component.module.css`



---



## 工程要求



来自架构规范 — 适用于全部 UI 工作：



- **Light mode default**（默认浅色模式）；深色模式可选

- **Mobile First** 响应式布局

- **Accessibility**（键盘导航、ARIA、对比度）

- **CSS Modules** + shadcn/ui（CSS Modules 适配）+ Radix UI

- **Motion** 用于页面过渡、对话框、抽屉、卡片动效



另见 [10-architecture.md](./10-architecture.md#ui-components) 与 [12-dev-standards.md](./12-dev-standards.md#engineering-standards)。

