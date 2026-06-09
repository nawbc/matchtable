---
title: MatchTable — 收藏与牵线请求
version: MVP v1.0
scope: feature
related:
  - docs/prd/02-roles-and-flows.md
  - docs/prd/04-feature-profile.md
  - docs/prd/09-database.md
---

# 模块 5：收藏

功能：

- 收藏用户
- 取消收藏
- 收藏列表
- 多选收藏项后跳转资料对比 — 见 [05-feature-discover.md](./05-feature-discover.md#模块-5资料对比)

---

# 模块 6：牵线请求

## 发送请求

字段：

```txt
message
```

约束：

- 最多 200 字符

## 状态

```txt
pending
accepted
rejected
cancelled
```

## 我的请求

支持的 Tab：

- 已发送
- 已接收

## 接受请求

请求被接受后，**双方**均可查看对方的联系方式（WeChat、LINE、Telegram、Email）。

联系方式字段在接受前保持隐藏 — 见 [04-feature-profile.md](./04-feature-profile.md#contact-information)。

## 相关文档

- **数据库表：** [`favorites`](./09-database.md#favorites)、[`requests`](./09-database.md#requests)、[`profiles`](./09-database.md#profiles)（联系方式字段） — 见 [09-database.md](./09-database.md)。
