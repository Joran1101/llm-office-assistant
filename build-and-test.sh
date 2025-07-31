#!/bin/bash

echo "🚀 LLM Office Assistant 一键构建和验证..."
echo ""

# 运行构建
echo "1️⃣ 开始构建..."
if ./build.sh; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

echo ""

# 运行验证
echo "2️⃣ 开始验证..."
if ./validate-build.sh; then
    echo "✅ 验证成功"
else
    echo "❌ 验证失败"
    exit 1
fi

echo ""
echo "🎉 构建和验证全部完成！"
echo ""
echo "📋 安装指南："
echo "Chrome:"
echo "  1. 打开 chrome://extensions/"
echo "  2. 启用开发者模式"
echo "  3. 点击'加载已解压的扩展程序'"
echo "  4. 选择 dist/chrome 文件夹"
echo ""
echo "Edge:"
echo "  1. 打开 edge://extensions/"
echo "  2. 启用开发人员模式"
echo "  3. 点击'加载解压缩的扩展'"
echo "  4. 选择 dist/edge 文件夹"
echo ""
echo "🎯 测试重点："
echo "  - 扩展图标显示正常"
echo "  - 四大功能都能工作"
echo "  - 重新生成按钮功能正常"
echo "  - API配置和调用正常" 