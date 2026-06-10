---
title: MatchTable — 开发规范与 MVP 验收
version: MVP v1.0
scope: standards
related:
  - docs/prd/10-architecture.md
  - docs/prd/README.md
---

# Cursor 开发规范

## 代码规范

**必须使用：**

- Strict TypeScript
- ESLint zero warnings
- Oxlint zero warnings
- Feature First Architecture

---

## 工程标准

**必须使用：**

- Mobile First
- Responsive
- Light Mode Default（默认浅色模式；深色模式可选）
- **Default Language: zh-CN**（用户界面默认简体中文；代码与注释保持英文）
- CSS Modules（禁止 TailwindCSS）
- Accessibility
- SEO Friendly

---

## Cursor 代码生成要求

Cursor 生成代码时**必须**：

- **首先**读取 [TanStack llms.txt](https://tanstack.com/llms.txt) 获取最新文档索引与 API
- 优先参考 TanStack 官方文档（Start、Router、Query、Form 等）
- 使用 **Vite+** 工具链（`vp dev` / `vp build` / `vp check`），遵循 [viteplus.dev](https://viteplus.dev/) 配置约定
- 遵循 TanStack Start 最佳实践
- 使用 Server Functions
- 使用 Query Options Pattern
- 使用 Mutation Options Pattern
- 使用 Suspense
- 使用 Streaming
- 禁止使用 `any`
- 禁止未使用变量

---

## 官方参考

**优先顺序（TanStack 文档较新，llms.txt 为首选入口）：**

1. **[https://tanstack.com/llms.txt](https://tanstack.com/llms.txt)** — 全站文档聚合索引（**开发前必读**）
2. https://tanstack.com/start
3. https://tanstack.com/router
4. https://tanstack.com/query
5. https://tanstack.com/form
6. https://tanstack.com/table
7. https://tanstack.com/virtual
8. https://tanstack.com/store
9. https://viteplus.dev/ — Vite+ 统一工具链

---

# MVP 验收标准

## 注册用户清单

用户能够：

- [ ] 注册与登录
- [ ] 创建 MatchTable
- [ ] 编辑 MatchTable
- [ ] 上传照片（1–9 张，排序，设置主图）
- [ ] 浏览发现广场
- [ ] 搜索与筛选资料
- [ ] 多份资料横向对比（2–4 份；可固定自己的相亲表为第一列）
- [ ] 收藏用户
- [ ] 发送牵线请求（message ≤ 200 字符）
- [ ] 查看请求状态（pending/accepted/rejected/cancelled）
- [ ] 接受牵线请求
- [ ] 双方接受后查看联系方式

## 访问控制清单

- [ ] 未登录无法访问受保护页面（自动跳转 `/login?redirect=…`）
- [ ] 已登录无法访问登录/注册/忘记密码页（自动跳转 post-auth 目的地）
- [ ] 非 admin 无法访问 dashboard 管理页
- [ ] 受保护 Server Function 在无 session 时返回 Unauthorized

## 管理员清单

管理员能够：

- [ ] 管理用户（搜索、详情、封禁/解封）
- [ ] 管理资料（查看、下架、删除）
- [ ] 管理举报（查看、标记已处理、封禁用户）
- [ ] 查看 Dashboard 统计数据

## 部署

- [ ] 项目可独立部署并在生产环境运行
