// mineral_platform — 同机 Jenkins 前端构建流水线
// 约定见 deploy.md
// 关键：先把源码放到 DEPLOY_ROOT 再 docker build，保证 volume 路径在宿主机存在

pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    DEPLOY_ROOT   = "${env.DEPLOY_ROOT ?: '/opt/mineral'}"
    BUILD_DIR     = "${DEPLOY_ROOT}/mineral_platform/build"
    DIST_DIR      = "${DEPLOY_ROOT}/mineral_platform/dist"
    NODE_IMAGE    = "${env.NODE_IMAGE ?: 'node:20-alpine'}"
    VITE_API_BASE_URL = "${env.VITE_API_BASE_URL ?: '/api/v1'}"
    VITE_WS_BASE_URL  = "${env.VITE_WS_BASE_URL ?: 'ws://192.168.1.102/api/v1/ws/progress'}"
  }

  stages {
    stage('Prepare') {
      steps {
        sh '''
          set -e
          mkdir -p "${DIST_DIR}" "${BUILD_DIR}"
        '''
      }
    }

    stage('Stage sources') {
      steps {
        sh '''
          set -e
          rm -rf "${BUILD_DIR}"
          mkdir -p "${BUILD_DIR}"
          tar -C "${WORKSPACE}" \
            --exclude='.git' \
            --exclude='node_modules' \
            --exclude='dist' \
            -cf - . | tar -C "${BUILD_DIR}" -xf -
        '''
      }
    }

    stage('Build') {
      steps {
        sh '''
          set -e
          # 临时构建容器；--rm 结束后自动删除。先清同名残留避免冲突
          docker rm -f mineral-platform 2>/dev/null || true
          docker run --rm --name mineral-platform \
            -v "${BUILD_DIR}":/app -w /app \
            -e VITE_API_BASE_URL="${VITE_API_BASE_URL}" \
            -e VITE_WS_BASE_URL="${VITE_WS_BASE_URL}" \
            ${NODE_IMAGE} \
            sh -c "npm ci && npm run build"
          test -f "${BUILD_DIR}/dist/index.html"
        '''
      }
    }

    stage('Publish dist') {
      steps {
        sh '''
          set -e
          mkdir -p "${DIST_DIR}"
          find "${DIST_DIR}" -mindepth 1 -delete
          tar -C "${BUILD_DIR}/dist" -cf - . | tar -C "${DIST_DIR}" -xf -
          echo "Published to ${DIST_DIR}"
          ls -la "${DIST_DIR}" | head
          test -f "${DIST_DIR}/index.html"
        '''
      }
    }

    stage('Reload nginx (optional)') {
      steps {
        sh '''
          set -e
          if docker ps --format '{{.Names}}' | grep -qx mineral-nginx; then
            # 若曾用 mv 换过目录，reload 不够，需 recreate 重新挂载
            docker restart mineral-nginx
          else
            echo "mineral-nginx 未运行 — 请先部署 mineral_api（含 nginx compose）"
          fi
        '''
      }
    }
  }

  post {
    success {
      echo "前端已发布。访问 http://192.168.1.102/ （Nginx :80）"
    }
    cleanup {
      sh '''
        rm -rf "${BUILD_DIR}" || true
        docker rm -f mineral-platform 2>/dev/null || true
      '''
    }
  }
}
