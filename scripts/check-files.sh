#!/bin/bash

echo "🔍 检查浏览器插件文件完整性..."

# 必需文件列表
required_files=(
    "manifest.json"
    "manifest.edge.json" 
    "background.js"
    "content.js"
    "content.css"
    "popup.html"
    "popup.js"
    "browser-compat.js"
    "icons/icon16.png"
    "icons/icon48.png"
    "icons/icon128.png"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
        echo "❌ 缺失文件: $file"
    else
        echo "✅ 文件存在: $file"
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "🎉 所有必需文件都已存在！"
    exit 0
else
    echo "⚠️  发现 ${#missing_files[@]} 个缺失文件，请先补充这些文件。"
    exit 1
fi 