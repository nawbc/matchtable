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
