---
title: MatchTable — 认证
version: MVP v1.0
scope: feature
related:
  - docs/prd/02-roles-and-flows.md
  - docs/prd/10-architecture.md
  - docs/prd/09-database.md
---

# 模块 1：用户认证

## 登录方式

支持的登录方式：

- Google Login
- Apple Login
- Github Login
- Phone OTP（一次性密码）登录

由 **Supabase Auth** 提供支持。

## 实现说明

- 用户记录由 Supabase Auth（`auth.users`）管理；应用表通过 `user_id` 关联。
- OAuth 提供商（Google、Apple、Github）与手机 OTP 须通过 Supabase Auth 配置接入。
- 认证成功后，用户获得 [02-roles-and-flows.md](./02-roles-and-flows.md) 中定义的注册用户权限。

## 访问控制实现

**双层防护：**

1. **路由 `beforeLoad` / `loader`** — 页面级访问控制与自动跳转
2. **Server Function** — `requireAuthUserId()` 二次校验，无 session 时返回 Unauthorized

### 路由守卫（`apps/web/src/lib/auth-guard.ts`）

| 函数 | 用途 |
|------|------|
| `requireAuth` | 未登录 → 跳转 `/login?redirect=<当前路径>` |
| `redirectIfAuthenticated` | 已登录 → 跳转 `/` |
| `resolvePostAuthDestination` | 登录/已登录访客路由默认目的地：`/` |
| `prefetchMyProfile` | `requireAuth` + 预取当前用户 profile |

### 登录后导航（`apps/web/src/features/auth/post-auth.ts`）

| 函数 | 用途 |
|------|------|
| `completeAuthSession` | 确保 profile 行存在、刷新 query，返回 post-auth 目的地 |
| `resolveAuthNavigationDestination` | 有效 `?redirect=` 站内路径优先；否则跳转 `/` |

### 客户端 session 同步

- `AuthSync`（`apps/web/src/features/auth/AuthSync.tsx`）监听 Supabase auth 状态，失效 session / profile query

### 页面内容与 CTA（随账户状态）

- 根路由 `beforeLoad` 注入 `session`；公开页 loader 在 `session` 存在时预取 `myProfile`
- 访客专属路由（`/login`、`/register`、`/forgot-password`）由 `redirectIfAuthenticated` 重定向至 `/`
- 公开页（`/`、`/discover`、`/profile/$id`）根据 session + profile 展示不同 CTA，**已登录用户不得出现「创建账号」**
- 共享组件：`ProfileCtaButton`、`resolveProfileCta` — 见 [02-roles-and-flows.md](./02-roles-and-flows.md#页面内容随账户状态变化)

### `redirect` 回跳参数

- 受保护路由未登录时：`/login?redirect=/compare?ids=…`（当前 `location.href`）
- 登录成功后：若 `redirect` 为有效站内路径（非 `/login` 等访客路由），优先跳转；OAuth 流程通过 `sessionStorage` 保留 redirect
- 校验：`isValidInternalRedirect()` — 必须以 `/` 开头、禁止 `//` 与访客 auth 路由

## 相关文档

- **数据库：** 用户由 Supabase Auth 管理 — 见 [09-database.md](./09-database.md#users)。
- **架构：** 认证经由 TanStack Start Server Functions — 见 [10-architecture.md](./10-architecture.md)。
