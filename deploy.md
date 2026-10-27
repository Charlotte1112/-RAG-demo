# mineral_platform 部署约定

与 `mineral_api`、Jenkins 同机部署时使用本约定。

## 宿主机目录布局

```text
/opt/mineral/                          # DEPLOY_ROOT（与 API / Jenkins 一致）
├── mineral_api/                       # 后端 + Nginx compose
│   └── docker/nginx/nginx.conf
└── mineral_platform/
    └── dist/                          # 本流水线唯一产物目录（Nginx 只读挂载）
```

前端**不**在部署目录长期保留源码；Jenkins workspace 构建后只同步 `dist/`。

## 构建与发布

```bash
# 本地或 CI
npm ci
# 生产变量见 .env.production；CI 可用环境变量覆盖
export VITE_API_BASE_URL=/api/v1
export VITE_WS_BASE_URL=ws://192.168.1.102/api/v1/ws/progress
npm run build
rsync -a --delete dist/ /opt/mineral/mineral_platform/dist/
```

同机经 Nginx 统一入口（`:80`）时：

| 变量 | 推荐值 | 说明 |
|------|--------|------|
| `VITE_API_BASE_URL` | `/api/v1` | 同域相对路径，由 Nginx 反代到 `api:8030` |
| `VITE_WS_BASE_URL` | `ws://<服务器IP或域名>/api/v1/ws/progress` | WebSocket 需写完整 host |
| `VITE_SUPABASE_URL` | 实际 Supabase 地址 | 写入 `.env.production` |
| `VITE_SUPABASE_ANON_KEY` | anon key | 写入 `.env.production` |

> Vite 构建时会合并 `.env.production` 与进程环境变量；Jenkinsfile 默认注入 API/WS 两项。

## 与 Nginx 的关系

- Nginx 由 **mineral_api** 的 `docker-compose.nginx.yml` 启动
- 挂载：`/opt/mineral/mineral_platform/dist` → 容器内 `/usr/share/nginx/html`
- `/api/` → `api:8030`（含 WebSocket）
- `/mineral-reports/` → `minio:9000`（知识库/报告预签名下载）
- 更新 `dist` 后一般只需 `nginx -s reload`（流水线已做）；无需重建前端镜像

首次上线顺序：先跑通 **mineral_api**（含 nginx）→ 再跑本仓库流水线发布 `dist`。

## Jenkins

- Job：Pipeline from SCM（本仓库 `Jenkinsfile`）
- 触发：GitLab Webhook → `main`
- 可选环境变量：`VITE_API_BASE_URL`、`VITE_WS_BASE_URL`、`DEPLOY_ROOT`、`NODE_IMAGE`
- 流程：源码暂存到 `/opt/mineral/mineral_platform/build` → 容器名 `mineral-platform` 内 `npm ci && build`（`--rm`，结束后删除）→ 原子替换 `dist/` → `nginx -s reload`
- 依赖：宿主机 Docker；Jenkins 已挂载同路径 `DEPLOY_ROOT`
- 线上前端由 **mineral-nginx** 托管 `dist`，没有长期运行的 `mineral-platform` 业务容器；若 `docker ps` 里出现随机名且命令为 `apt-get`，多为中断的 Jenkins 镜像构建残留，可 `docker rm -f <id>` 删掉

## 回滚

保留历史 `dist` 备份即可，例如：

```bash
# 发布前流水线外手工备份
cp -a /opt/mineral/mineral_platform/dist /opt/mineral/mineral_platform/dist.bak.$(date +%Y%m%d%H%M)
# 回滚
rsync -a --delete /opt/mineral/mineral_platform/dist.bak.YYYYMMDDHHMM/ \
  /opt/mineral/mineral_platform/dist/
docker exec mineral-nginx nginx -s reload
```
