---
title: MatchTable — 角色与流程
version: MVP v1.0
scope: feature
related:
  - docs/prd/01-product-overview.md
  - docs/prd/03-feature-auth.md
  - docs/prd/05-feature-discover.md
  - docs/prd/06-feature-social.md
---

# 用户角色

## 访客

**权限：**

- 浏览首页
- 浏览公开发现广场
- 查看部分公开资料

**限制：**

- 不能收藏用户
- 不能发送牵线请求
- 不能使用资料对比

## 注册用户

**权限：**

- 创建 MatchTable
- 编辑资料
- 上传照片
- 收藏用户
- 资料对比（多表横向对照，可固定自己的相亲表）
- 发送牵线请求
- 接收牵线请求
- 接受牵线请求
- 查看联系方式（双方接受后）

## 管理员

**权限：**

- 用户管理
- 内容审核
- 举报管理
- 数据统计

---

# 路由访问矩阵

## apps/web（用户端）

| 角色 | 可访问 | 不可访问（路由守卫自动跳转） |
|------|--------|------------------------------|
| 访客 | `/`、`/discover`、`/profile/$id`（active 资料）、`/login`、`/register`、`/forgot-password` | `/me/*`、`/compare`、`/profile/create`、`/profile/edit` → 跳转 `/login?redirect=…` |
| 注册用户 | 上述 + `/me/*`、`/compare`、`/profile/create`、`/profile/edit` | `/login`、`/register`、`/forgot-password` → 跳转 `/` |
| 管理员（web） | 与普通注册用户相同（web 不区分 admin UI） | 同注册用户 |

## 页面内容随账户状态变化

路由守卫决定**能否进入**某路径；同一公开路径上，**文案与 CTA 仍须随 session / profile 状态切换**，避免已登录用户仍看到「创建账号」「注册」等访客引导。

| 页面 | 访客 | 已登录（无 profile） | 已登录（hidden） | 已登录（active） |
|------|------|----------------------|------------------|------------------|
| `AppHeader` | 发现、登录、注册 | 发现、我的资料、收藏、牵线、对比、退出 | 同左 | 同左 |
| `/` 首页次要 CTA | 创建账号 → `/register` | 创建资料 → `/profile/create` | 完善资料 → `/profile/edit` | 我的资料 → `/me` |
| `/discover` | 同上次要 CTA | 同上 | 同上 | 同上 |
| `/profile/$id`（他人） | 加入对比 → 登录；收藏/牵线 → 登录 | 加入对比、收藏、牵线、举报 | 同左 | 同左 |
| `/profile/$id`（本人） | — | — | 编辑资料 → `/profile/edit` | 编辑资料（无收藏/牵线） |

实现：`ProfileCtaButton`（`features/profile/profile-cta.tsx`）+ 根路由 `session` 与按需预取 `myProfile`。

## apps/dashboard（管理后台）

| 角色 | 可访问 | 不可访问 |
|------|--------|----------|
| 访客 | `/login`、`/auth/callback` | `/`、`/users/*`、`/profiles/*`、`/reports` → 跳转 `/login` |
| 已登录非 admin | `/login`（显示无权限提示） | 管理路由 → 跳转 `/login` |
| admin | 全部管理路由 | — |

---

# 核心业务流程

## 用户注册流程

```
注册
  ↓
完善资料
  ↓
上传照片
  ↓
填写择偶要求
  ↓
发布 MatchTable
```

## 用户牵线流程

```
浏览广场
  ↓
查看资料
  ↓
发送牵线请求
  ↓
对方接受
  ↓
查看联系方式
  ↓
线下见面
```

## 资料对比流程

```
收藏 / 浏览时加入对比
  ↓
打开对比页（可选固定我的相亲表）
  ↓
横向对照关键条件
  ↓
查看详情 / 发起牵线请求
```
