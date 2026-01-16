# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package.json package-lock.json* ./

# 安装依赖（优先使用 npm ci，如果失败则使用 npm install）
RUN npm ci || npm install

# 复制源代码
COPY . .

# 设置构建时环境变量（默认值，可在 docker-compose 中覆盖）
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
