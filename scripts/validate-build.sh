#!/bin/bash

echo "🔍 验证构建结果..."

# 检查构建目录
if [ ! -d "dist" ]; then
    echo "❌ dist目录不存在，请先运行 ./build.sh"
    exit 1
fi

# 检查Chrome版本
echo "🌐 检查Chrome版本..."
chrome_files=(
    "dist/chrome/manifest.json"
    "dist/chrome/background.js"
    "dist/chrome/content.js"
    "dist/chrome/popup.js"
    "dist/chrome/icons/icon16.png"
    "dist/chrome/icons/icon48.png"
    "dist/chrome/icons/icon128.png"
)

chrome_ok=true
for file in "${chrome_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Chrome版本缺失文件: $file"
        chrome_ok=false
    fi
done

if $chrome_ok; then
    echo "✅ Chrome版本文件完整"
else
    echo "❌ Chrome版本文件不完整"
fi

# 检查Edge版本
echo "🔷 检查Edge版本..."
edge_files=(
    "dist/edge/manifest.json"
    "dist/edge/background.js"
    "dist/edge/content.js"
    "dist/edge/popup.js"
    "dist/edge/icons/icon16.png"
    "dist/edge/icons/icon48.png"
    "dist/edge/icons/icon128.png"
)

edge_ok=true
for file in "${edge_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Edge版本缺失文件: $file"
        edge_ok=false
    fi
done

if $edge_ok; then
    echo "✅ Edge版本文件完整"
else
    echo "❌ Edge版本文件不完整"
fi

# 检查manifest差异
echo "📋 检查manifest文件差异..."
if [ -f "dist/chrome/manifest.json" ] && [ -f "dist/edge/manifest.json" ]; then
    chrome_name=$(grep '"name"' dist/chrome/manifest.json)
    edge_name=$(grep '"name"' dist/edge/manifest.json)
    
    echo "   Chrome名称: $chrome_name"
    echo "   Edge名称: $edge_name"
fi

# 检查ZIP包
echo "📦 检查ZIP包..."
zip_files=("llm-assistant-chrome-v1.1.8.zip" "llm-assistant-edge-v1.1.8.zip")

for zip_file in "${zip_files[@]}"; do
    if [ -f "$zip_file" ]; then
        echo "✅ 找到ZIP包: $zip_file"
        if command -v unzip >/dev/null 2>&1; then
            # 测试ZIP包完整性
            if unzip -t "$zip_file" >/dev/null 2>&1; then
                echo "✅ ZIP包完整性验证通过: $zip_file"
            else
                echo "❌ ZIP包损坏: $zip_file"
            fi
        fi
    else
        echo "❌ 缺失ZIP包: $zip_file"
    fi
done

if $chrome_ok && $edge_ok; then
    echo ""
    echo "🎉 构建验证通过！可以开始安装测试。"
    exit 0
else
    echo ""
    echo "❌ 构建验证失败，请检查并重新构建。"
    exit 1
fi 