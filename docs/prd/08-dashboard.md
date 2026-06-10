---
title: MatchTable — Dashboard 管理后台
version: MVP v1.0
scope: feature
related:
  - docs/prd/07-feature-reports.md
  - docs/prd/09-database.md
  - docs/prd/10-architecture.md
---

# Dashboard 管理后台

管理后台位于 monorepo 内的 `apps/dashboard` — 见 [10-architecture.md](./10-architecture.md#monorepo-structure)。

## 权限与访问控制

**双层防护：**

1. 路由 `requireAdminRoute`（`apps/dashboard/src/lib/admin-guard.ts`）
2. Server Function `requireAdmin()`（`apps/dashboard/src/features/admin/server.ts`）

### admin 判定

- Supabase Auth `app_metadata.role === 'admin'`
- session 映射为 `session.user.isAdmin`

### 路由守卫

| 函数 | 用途 |
|------|------|
| `requireAdminRoute` | 无 session 或非 admin → 跳转 `/login` |
| `redirectIfAdminAuthenticated` | admin 已登录访问 `/login` → 跳转 `/`；非 admin 已登录 → 返回 `{ forbidden: true }`，页面直接显示无权限 |

### 公开路由

- `/login`
- `/auth/callback`

### 非 admin 登录行为

- OAuth 回调后若无 admin 权限，显示错误并引导回 `/login`
- 已登录非 admin 访问 `/login`：`beforeLoad` 传入 `forbidden: true`，立即显示「无管理员权限」

### 与 web 应用隔离

- 独立 `apps/dashboard` 应用与 Supabase 项目配置
- web 端不暴露 admin UI；admin 仅通过 dashboard 访问

---

# Dashboard 首页

展示：

- 用户总数
- MatchTable（资料）总数
- 今日新增用户
- 今日新增资料

---

# 用户管理

功能：

- 搜索用户
- 查看用户详情
- 封禁用户
- 解封用户

---

# 资料管理

功能：

- 查看资料详情
- 下架资料（Takedown profile）
- 删除资料

---

# 举报管理

功能：

- 查看举报
- 标记举报已处理
- 封禁被举报用户

## 相关文档

- **数据库表：** 全部表 — [`profiles`](./09-database.md#profiles)、[`profile_photos`](./09-database.md#profile_photos)、[`favorites`](./09-database.md#favorites)、[`requests`](./09-database.md#requests)、[`reports`](./09-database.md#reports) — 见 [09-database.md](./09-database.md)。
- **举报功能：** [07-feature-reports.md](./07-feature-reports.md)。
