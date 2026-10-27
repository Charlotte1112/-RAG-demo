# mineral_platform

矿产资源储量报告智能化预评审服务平台 — 前端（React + Vite）。

GitLab：`http://192.168.1.102:8929/mineral/mineral_platform.git`

## 本地开发

```bash
npm ci
cp .env.production .env.local   # 或按需编辑 .env
npm run dev
```

## 生产构建

```bash
npm ci
npm run build   # 产物在 dist/
```

同机经 Nginx 反代时，生产变量见 `.env.production`（`VITE_API_BASE_URL=/api/v1`）。

## 部署 / Jenkins

目录约定与流水线说明见 [deploy.md](./deploy.md)。仓库根目录 `Jenkinsfile`：构建 → 同步到 `/opt/mineral/mineral_platform/dist` → reload Nginx。

上线顺序：先部署 **mineral_api**（含 Nginx）→ 再跑本仓库流水线。
