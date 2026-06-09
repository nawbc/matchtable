---
title: MatchTable — 数据库 Schema
version: MVP v1.0
scope: data
related:
  - docs/prd/04-feature-profile.md
  - docs/prd/06-feature-social.md
  - docs/prd/07-feature-reports.md
  - docs/prd/10-architecture.md
---

# 数据库设计

所有应用表须启用 **Row Level Security (RLS)** 并配置相应策略 — 见 [10-architecture.md](./10-architecture.md#supabase-requirements)。

---

## users

由 **Supabase Auth**（`auth.users`）管理。

**读写模块：**

| 模块 | 访问权限 |
|------|----------|
| Auth (03) | 通过 Supabase Auth 读写 |
| Dashboard (08) | 读（封禁/解封、搜索） |

---

## profiles

```sql
create table profiles (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null,

  nickname text,

  gender text,

  birthday date,

  avatar_url text,

  height int,

  weight int,

  education text,

  school text,

  city text,

  occupation text,

  income text,

  house boolean default false,

  car boolean default false,

  marital_status text,

  accept_ldr boolean default false,

  hobbies text[],

  requirements text,

  bio text,

  wechat text,

  telegram text,

  line text,

  email text,

  status text default 'active',

  created_at timestamptz default now(),

  updated_at timestamptz default now()
);
```

**读写模块：**

| 模块 | 访问权限 |
|------|----------|
| Profile (04) | 读写（创建、编辑、发布） |
| Discover (05) | 读（列表、详情、筛选、排序） |
| Social (06) | 读（接受后读取联系方式字段） |
| Dashboard (08) | 读写（查看、下架、删除） |

---

## profile_photos

```sql
create table profile_photos (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null,

  url text not null,

  sort_order int default 0,

  created_at timestamptz default now()
);
```

**读写模块：**

| 模块 | 访问权限 |
|------|----------|
| Profile (04) | 读写（上传、删除、排序、设置主图） |
| Discover (05) | 读（列表与详情展示） |
| Dashboard (08) | 读（审核） |

---

## favorites

```sql
create table favorites (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null,

  profile_id uuid not null,

  created_at timestamptz default now()
);
```

**读写模块：**

| 模块 | 访问权限 |
|------|----------|
| Social (06) | 读写（添加、移除、列表） |
| Discover (05) | 读写（详情页收藏/取消收藏） |

---

## requests

```sql
create table requests (
  id uuid primary key default gen_random_uuid(),

  from_user_id uuid not null,

  to_user_id uuid not null,

  message text,

  status text default 'pending',

  created_at timestamptz default now()
);
```

**状态值：** `pending`、`accepted`、`rejected`、`cancelled` — 见 [06-feature-social.md](./06-feature-social.md#status)。

**读写模块：**

| 模块 | 访问权限 |
|------|----------|
| Social (06) | 读写（发送、接受、拒绝、取消、已发送/已接收列表） |

---

## reports

```sql
create table reports (
  id uuid primary key default gen_random_uuid(),

  reporter_id uuid not null,

  target_user_id uuid not null,

  reason text,

  detail text,

  status text default 'pending',

  created_at timestamptz default now()
);
```

**读写模块：**

| 模块 | 访问权限 |
|------|----------|
| Reports (07) | 写（提交举报） |
| Dashboard (08) | 读写（查看、标记已处理、封禁用户） |
