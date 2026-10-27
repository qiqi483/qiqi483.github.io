---
title: "Loom Studio"
date: '2026-10-27T12:00:00+08:00'
draft: false
description: "一个可回放每一步决策的轻量 LLM 应用开发平台"
tags: ["AI", "LLM", "工作流"]
categories: ["AI"]
---

## 项目简介

Loom Studio 是一个纯前端即可运行的轻量 LLM 应用开发平台，项目结构与 Dify 的核心能力对齐：可视化工作流、Prompt IDE、RAG 知识库、模型配置与可观测性。它不依赖数据库，默认使用内存与 `localStorage` 保存数据，开箱即可演示。

## 在线体验

👉 [打开 Loom Studio](/loom-studio/)

## 主要特点

- 可视化工作流：拖拽节点画布，支持 Start / LLM / Retrieval / Agent / Condition / Code / End 节点
- Run Replay 时间旅行调试：每次运行记录节点级输入 / 输出与耗时，可逐步回放定位问题
- Agent 决策轨迹：思考、工具调用与观察结果全程可见，方便复盘自主决策过程
- Prompt A/B 回归实验室：同一组用例同时跑两个提示词版本，输出差异高亮与质量评分
- 无 Key 可演示：未配置模型供应商时使用内置模拟引擎，完整保留工作流、检索与回放体验
