# 提示词模板系统设计

## 核心设计

提示词模板系统允许用户自定义系统功能的行为，无需修改代码。

## 功能架构

```
┌─────────────────────────────────────────────────────────────┐
│                   提示词模板系统                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │  预置模板        │    │  用户自定义模板   │               │
│  │  (系统提供)      │    │  (用户配置)      │               │
│  └────────┬────────┘    └────────┬────────┘               │
│           │                     │                         │
│           └──────────┬───────────┘                         │
│                      ▼                                     │
│           ┌─────────────────┐                             │
│           │  模板管理器      │                             │
│           │ PromptManager    │                             │
│           └────────┬────────┘                             │
│                    │                                       │
│           ┌────────┴────────┐                             │
│           ▼                 ▼                              │
│  ┌─────────────────┐ ┌─────────────────┐                 │
│  │  模板执行器      │ │  LLM 调用        │                 │
│  │  TemplateEngine │ │                  │                 │
│  └─────────────────┘ └─────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 代码实现

### 模板管理器

```python
# app/prompts/manager.py
from typing import Dict, Optional, Any
from pydantic import BaseModel
from datetime import datetime
import json

class PromptTemplate(BaseModel):
    """提示词模板"""
    name: str
    description: str
    template: str
    variables: list[str]
    output_format: str = "text"  # text, json, markdown
    user_customizable: bool = True
    version: int = 1
    created_at: datetime = None
    updated_at: datetime = None

class PromptManager:
    """提示词模板管理器"""

    def __init__(self):
        self._templates: Dict[str, PromptTemplate] = {}
        self._defaults: Dict[str, str] = {}  # 记录默认模板

    def register(self, template: PromptTemplate, as_default: bool = False):
        """注册提示词模板"""
        if as_default:
            self._defaults[template.name] = template.template

        self._templates[template.name] = template

    def get(self, name: str) -> Optional[PromptTemplate]:
        """获取模板"""
        return self._templates.get(name)

    def render(self, name: str, variables: Dict[str, Any]) -> str:
        """渲染模板"""
        template = self.get(name)
        if not template:
            raise ValueError(f"Template not found: {name}")

        return template.template.format(**variables)

    def customize(self, name: str, custom_template: str) -> bool:
        """用户自定义模板"""
        template = self.get(name)
        if not template:
            return False

        if not template.user_customizable:
            raise ValueError(f"Template {name} is not customizable")

        template.template = custom_template
        template.version += 1
        template.updated_at = datetime.now()
        return True

    def reset(self, name: str) -> bool:
        """重置为默认模板"""
        if name not in self._defaults:
            return False

        template = self.get(name)
        if template:
            template.template = self._defaults[name]
            template.version += 1
            template.updated_at = datetime.now()
        return True

    def list_templates(self) -> list[Dict]:
        """列出所有模板"""
        return [
            {
                "name": t.name,
                "description": t.description,
                "customizable": t.user_customizable,
                "version": t.version
            }
            for t in self._templates.values()
        ]
```

### 预置模板示例

```python
# app/prompts/builtin.py

# 预置分类模板
CLASSIFICATION_TEMPLATE = PromptTemplate(
    name="classification",
    description="邮件分类功能",
    template="""你是一个邮件分类专家。

邮件信息：
- 发件人: {sender}
- 主题: {subject}
- 内容: {content}

请根据以下类别对邮件进行分类：
- work_urgent: 紧急工作邮件
- work_normal: 普通工作邮件
- personal: 个人邮件
- subscription: 订阅邮件
- notification: 系统通知
- promotion: 营销推广
- spam: 垃圾邮件

返回JSON格式：
{{"category": "类别", "priority": "优先级", "reason": "分类理由"}}""",
    variables=["sender", "subject", "content"],
    output_format="json",
    user_customizable=True
)

# 预置提取模板
EXTRACTION_TEMPLATE = PromptTemplate(
    name="extraction",
    description="信息提取功能",
    template="""你是一个信息提取专家。请从以下邮件中提取关键信息：

邮件内容：
{content}

请提取：
1. 行动项（任务描述、截止时间、优先级）
2. 会议信息（标题、时间、地点）
3. 截止日期
4. 关键实体（人名、公司、项目名）

返回JSON格式：
{{"action_items": [], "meetings": [], "deadlines": [], "entities": []}}""",
    variables=["content"],
    output_format="json",
    user_customizable=True
)

# 预置摘要模板
SUMMARY_TEMPLATE = PromptTemplate(
    name="summary",
    description="摘要生成功能",
    template="""请根据以下邮件生成{summary_type}摘要：

{emails_text}

要求：
1. 突出重要事项和待办
2. 按类别分组
3. 使用Markdown格式
4. 简洁明了

摘要：""",
    variables=["summary_type", "emails_text"],
    output_format="markdown",
    user_customizable=True
)

# 预置回复模板
REPLY_TEMPLATE = PromptTemplate(
    name="reply",
    description="回复建议功能",
    template="""你是一个邮件回复助手。

发件人信息：
- 姓名: {sender_name}
- 关系: {relation}

邮件内容：
{content}

请生成2-3个回复选项，包含：
1. 确认类回复
2. 询问类回复
3. 婉拒类回复（如适用）

语气要求：{tone}

回复选项：""",
    variables=["sender_name", "relation", "content", "tone"],
    output_format="text",
    user_customizable=True
)
```

### 模板执行器

```python
# app/prompts/engine.py
from typing import Dict, Any, Optional
from langchain_core.language_models import BaseChatModel
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_core.prompts import PromptTemplate as LCPromptTemplate
from .manager import PromptManager

class PromptEngine:
    """提示词执行引擎"""

    def __init__(
        self,
        llm: BaseChatModel,
        prompt_manager: PromptManager
    ):
        self.llm = llm
        self.prompt_manager = prompt_manager

    async def execute(
        self,
        template_name: str,
        variables: Dict[str, Any],
        output_format: Optional[str] = None
    ) -> Any:
        """执行提示词模板"""
        template = self.prompt_manager.get(template_name)
        if not template:
            raise ValueError(f"Template not found: {template_name}")

        # 渲染模板
        prompt_text = self.prompt_manager.render(template_name, variables)

        # 选择输出解析器
        format_type = output_format or template.output_format
        if format_type == "json":
            parser = JsonOutputParser()
            prompt = LCPromptTemplate.from_template(prompt_text + "\n\n{format_instructions}")
        else:
            parser = StrOutputParser()
            prompt = LCPromptTemplate.from_template(prompt_text)

        # 构建链
        if format_type == "json":
            chain = prompt | self.llm | parser
            result = await chain.ainvoke({
                "format_instructions": parser.get_format_instructions()
            })
        else:
            chain = prompt | self.llm | parser
            result = await chain.ainvoke({})

        return result

# 使用示例
async def classify_email(llm, prompt_manager, email_data):
    engine = PromptEngine(llm, prompt_manager)

    result = await engine.execute(
        template_name="classification",
        variables={
            "sender": email_data["sender"],
            "subject": email_data["subject"],
            "content": email_data["content"]
        },
        output_format="json"
    )

    return result
```

### 用户配置 API

```python
# app/api/routes/prompts.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/v1/prompts", tags=["prompts"])

class PromptUpdateRequest(BaseModel):
    template: str
    variables: Optional[list[str]] = None

class PromptTestRequest(BaseModel):
    template: str
    variables: dict

@router.get("")
async def list_templates(prompt_manager: PromptManager):
    """列出所有可用模板"""
    return {"templates": prompt_manager.list_templates()}

@router.get("/{name}")
async def get_template(name: str, prompt_manager: PromptManager):
    """获取模板详情"""
    template = prompt_manager.get(name)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.put("/{name}")
async def update_template(
    name: str,
    request: PromptUpdateRequest,
    prompt_manager: PromptManager
):
    """更新模板（用户自定义）"""
    try:
        prompt_manager.customize(name, request.template)
        return {"message": "Template updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{name}/reset")
async def reset_template(name: str, prompt_manager: PromptManager):
    """重置为默认模板"""
    if not prompt_manager.reset(name):
        raise HTTPException(status_code=404, detail="Template not found or no default")
    return {"message": "Template reset to default"}

@router.post("/test")
async def test_template(
    request: PromptTestRequest,
    llm: BaseChatModel,
    prompt_manager: PromptManager
):
    """测试模板"""
    engine = PromptEngine(llm, prompt_manager)
    result = await engine.execute(
        template_name="__test__",
        variables=request.variables
    )
    return {"result": result}
```

## 配置示例

### YAML 配置

```yaml
# config/prompts.yaml

prompts:
  classification:
    enabled: true
    default_template: "builtin_classification"
    user_customizable: true
    cache_results: true
    cache_ttl: 3600

  extraction:
    enabled: true
    default_template: "builtin_extraction"
    user_customizable: true

  summary:
    enabled: true
    default_template: "builtin_summary"
    user_customizable: true
    types:
      - daily
      - weekly
      - custom

  reply:
    enabled: true
    default_template: "builtin_reply"
    user_customizable: true
    tone_options:
      - formal
      - friendly
      - casual
```

### 用户自定义配置

```json
{
  "custom_prompts": {
    "classification": {
      "template": "你是我公司的邮件助手。请按以下规则分类：...",
      "variables": ["content"]
    },
    "summary": {
      "template": "请生成简洁的摘要，突出：\n1. 紧急事项\n2. 今日待办\n3. 会议安排\n\n邮件：{emails_text}",
      "variables": ["emails_text"]
    }
  }
}
```

## 优势

| 特性 | 说明 |
|-----|------|
| **无需代码修改** | 用户可直接修改配置调整功能 |
| **版本管理** | 模板有版本号，可回滚 |
| **测试支持** | 支持模板测试验证 |
| **灵活性** | 不同场景使用不同模板 |
| **可扩展** | 轻松添加新功能模板 |