#!/bin/bash
# funfenCare 快速启动脚本

set -e

echo "🏡 启动 funfenCare 项目..."

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose 未安装，请先安装"
    exit 1
fi

# 复制环境变量文件
if [ ! -f backend/.env ]; then
    echo "📝 创建 .env 文件..."
    cp backend/.env.example backend/.env
    echo "✅ 已创建 backend/.env，请根据需要修改配置"
fi

# 启动服务
echo "🚀 启动服务..."
docker-compose up -d

echo ""
echo "✅ 服务启动完成！"
echo ""
echo "📍 服务地址："
echo "  - API 文档: http://localhost:8000/docs"
echo "  - EMQX 控制台: http://localhost:18083 (admin/public)"
echo "  - InfluxDB: http://localhost:8086"
echo ""
echo "📋 常用命令："
echo "  - 查看日志: docker-compose logs -f"
echo "  - 停止服务: docker-compose down"
echo "  - 重启服务: docker-compose restart"
