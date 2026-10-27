# -RAG-demo
本项目是「矿产资源储量报告智能化预评审服务平台」前端，基于 React 18 + TypeScript + Vite + Tailwind，配合 ECharts 构建。数据层采用双通道：看板走 Supabase 直查，报告上传、解析、入库等重业务走自研 REST API，统一封装并接入 JWT 鉴权。  核心亮点是文档解析质检：用 pdfjs-dist 按页懒渲染 PDF，自研 Markdown 渲染器解析 GFM/HTML 表格与 KaTeX 公式，形成「原件 PDF + 页级解析」双栏对照，支持页码同步与全屏。知识库分层建模，支持上传、解析预览、确认入库、Milvus 向量化的异步入库流水线，是一套面向专业评审的 RAG 智能前端
