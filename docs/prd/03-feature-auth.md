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

## 相关文档

- **数据库：** 用户由 Supabase Auth 管理 — 见 [09-database.md](./09-database.md#users)。
- **架构：** 认证经由 TanStack Start Server Functions — 见 [10-architecture.md](./10-architecture.md)。
