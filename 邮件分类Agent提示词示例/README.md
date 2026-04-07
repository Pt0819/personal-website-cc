# 邮件分类系统 Agent 开发子代理

本文档定义了邮件分类系统的 4 个开发子代理角色和对应的系统提示词。

---

## v4 版本（最终推荐）★

### 核心角色（4个开发代理）

| 角色 | 职责 | 技术栈 |
|-----|------|--------|
| **Product Manager** | 需求分析、任务拆分、需求文档 | 业务理解 |
| **Frontend Developer** | 前端开发、API集成、联调测试 | React + TypeScript |
| **Backend Developer** | API开发、业务逻辑、单元测试 | Go + Gin + MySQL |
| **Agent Developer** | Agent系统、LLM封装、提示词工程 | Python + LangChain |

### 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                    Product Manager Agent                         │
│                  需求分析 · 任务拆分 · 验收标准                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Frontend Dev   │ │   Backend Dev   │ │  Agent Dev      │
│  Agent          │ │   Agent         │ │  Agent          │
│                 │ │                 │ │                 │
│  React + TS     │ │   Go + Gin      │ │  Python + Lang  │
│  + 联调测试     │ │   + 单测        │ │  + 提示词工程    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 开发流程

```
需求 → Product Manager(需求文档) → 任务分发
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
      Frontend Dev          Backend Dev           Agent Dev
      (组件开发)            (API开发+单测)        (Agent开发)
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    ▼
                              前后端联调
                              Agent联调
                                    ▼
                              Product验收
```

---

## 文件结构

```
邮件分类Agent提示词示例/
│
├── v4-00-架构说明.md                  # ★ v4 架构说明（推荐阅读）
├── v4-01-product-manager-agent.md     # ★ 产品经理代理
├── v4-02-frontend-developer-agent.md  # ★ 前端开发代理
├── v4-03-backend-developer-agent.md   # ★ 后端开发代理
├── v4-04-agent-developer-agent.md     # ★ Agent开发代理
│
├── v3-架构设计说明.md                  # v3 架构（参考）
├── v3-prompt-template-system.md        # 提示词模板（参考）
│
└── README.md                          # 本文件
```

---

## 快速开始

### 1. 理解架构
阅读 [v4-00-架构说明.md](v4-00-架构说明.md)

### 2. 查看开发代理
| 角色 | 文档 | 关键职责 |
|-----|------|---------|
| 产品经理 | [v4-01-product-manager-agent.md](v4-01-product-manager-agent.md) | 需求分析、任务拆分 |
| 前端开发 | [v4-02-frontend-developer-agent.md](v4-02-frontend-developer-agent.md) | 组件开发、联调 |
| 后端开发 | [v4-03-backend-developer-agent.md](v4-03-backend-developer-agent.md) | API开发、单测 |
| Agent开发 | [v4-04-agent-developer-agent.md](v4-04-agent-developer-agent.md) | Agent系统、LLM |

---

## 质量保障

| 角色 | 质量要求 |
|-----|---------|
| **Product Manager** | 需求文档完整、验收标准明确 |
| **Frontend Developer** | 错误处理完善、组件测试、联调通过 |
| **Backend Developer** | 单元测试覆盖 >70%、接口文档完整 |
| **Agent Developer** | 提示词效果验证、单测通过 |

---

## 版本历史

| 版本 | 说明 |
|-----|------|
| **v4** | 最终版，4个开发代理（产品、前端、后端、Agent） |
| v3 | 分离开发代理和系统功能（已废弃） |
| v2 | 5个角色代理（已废弃） |
| v1 | 7个细粒度代理（已废弃） |
