---
title: MatchTable — 资料（MatchTable）
version: MVP v1.0
scope: feature
related:
  - docs/prd/02-roles-and-flows.md
  - docs/prd/09-database.md
  - docs/prd/11-ui-design.md
---

# 模块 2：MatchTable（资料）

## 基本信息

| 字段 | 类型 |
|------|------|
| Nickname | string |
| Gender | enum |
| Birthday | date |
| Height | number |
| Weight | number |
| Education | string |
| School | string |
| City | string |
| Occupation | string |
| Annual income | string |
| Has house | boolean |
| Has car | boolean |
| Marital status | enum |
| Accept long-distance relationship | boolean |

## 爱好

支持：

- 多选标签
- 自定义标签

## 自我介绍（Bio）

字段：

```txt
bio
```

约束：

- 最多 2000 字符

## 择偶要求

字段：

- 年龄范围
- 身高范围
- 学历要求
- 城市要求
- 婚姻状况要求
- 补充说明

## 联系方式

字段：

- WeChat
- LINE
- Telegram
- Email

**默认：** 隐藏。

**可见性：** 仅在双方同意牵线后展示。

## 照片管理

约束：

- 最少 1 张
- 最多 9 张

功能：

- 上传
- 删除
- 排序
- 设置主图

## 相关文档

- **数据库表：** [`profiles`](./09-database.md#profiles)、[`profile_photos`](./09-database.md#profile_photos) — 见 [09-database.md](./09-database.md)。
- **UI：** Table Card 品牌组件 — 见 [11-ui-design.md](./11-ui-design.md)。
