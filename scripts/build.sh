#!/bin/bash

# 设置错误时退出
set -e

echo "🚀 开始构建 LLM Office Assistant 浏览器扩展..."
echo "📅 构建时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 清理旧的构建文件
echo "🧹 清理旧构建文件..."
rm -rf dist/
rm -f llm-assistant-*.zip

# 创建构建目录
echo "📁 创建构建目录..."
mkdir -p dist/chrome dist/edge

# 检查必需文件
echo "🔍 检查必需文件..."
required_files=(
    "manifest.json"
    "manifest.edge.json"
    "background.js"
    "content.js"
    "content.css"
    "popup.html"
    "popup.js"
    "browser-compat.js"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 错误: 缺失必需文件 $file"
        exit 1
    fi
done

# 检查图标文件
echo "🎨 检查图标文件..."
if [ ! -d "icons" ]; then
    echo "❌ 错误: icons 目录不存在"
    exit 1
fi

icon_files=("icons/icon16.png" "icons/icon48.png" "icons/icon128.png")
for icon in "${icon_files[@]}"; do
    if [ ! -f "$icon" ]; then
        echo "❌ 错误: 缺失图标文件 $icon"
        exit 1
    else
        echo "✅ 图标文件存在: $icon"
    fi
done

echo "✅ 所有必需文件检查通过"
echo ""

# 复制公共文件的函数 - 修复图标复制问题
copy_common_files() {
    local target_dir=$1
    echo "📄 复制公共文件到 $target_dir..."
    
    # 复制JavaScript文件
    echo "  📜 复制JS文件..."
    cp background.js "$target_dir/"
    cp content.js "$target_dir/"
    cp popup.js "$target_dir/"
    cp browser-compat.js "$target_dir/"
    
    # 复制样式文件
    echo "  🎨 复制CSS文件..."
    cp content.css "$target_dir/"
    
    # 复制HTML文件
    echo "  📄 复制HTML文件..."
    cp popup.html "$target_dir/"
    
    # 创建图标目录并复制图标文件 - 关键修复！
    echo "  🖼️  复制图标文件..."
    mkdir -p "$target_dir/icons"
    cp icons/icon16.png "$target_dir/icons/"
    cp icons/icon48.png "$target_dir/icons/"
    cp icons/icon128.png "$target_dir/icons/"
    
    # 验证图标复制成功
    if [ -f "$target_dir/icons/icon16.png" ] && [ -f "$target_dir/icons/icon48.png" ] && [ -f "$target_dir/icons/icon128.png" ]; then
        echo "  ✅ 图标文件复制成功"
    else
        echo "  ❌ 图标文件复制失败"
        exit 1
    fi
    
    # 复制可选的测试文件（如果存在）
    if [ -f "test.html" ]; then
        echo "  📝 复制测试文件..."
        cp test.html "$target_dir/"
    fi
    
    if [ -f "test-readability.html" ]; then
        cp test-readability.html "$target_dir/"
    fi
    
    echo "  ✅ 公共文件复制完成"
}

# 构建Chrome版本
echo "🌐 构建Chrome版本..."
copy_common_files "dist/chrome"
cp manifest.json dist/chrome/
echo "✅ Chrome版本构建完成"
echo ""

# 构建Edge版本
echo "🔷 构建Edge版本..."
copy_common_files "dist/edge"
cp manifest.edge.json dist/edge/manifest.json
echo "✅ Edge版本构建完成"
echo ""

# 详细验证构建结果
echo "🔍 详细验证构建结果..."

# 验证Chrome版本
echo "📋 验证Chrome版本文件..."
chrome_check_files=(
    "dist/chrome/manifest.json"
    "dist/chrome/background.js"
    "dist/chrome/content.js"
    "dist/chrome/popup.js"
    "dist/chrome/content.css"
    "dist/chrome/popup.html"
    "dist/chrome/browser-compat.js"
    "dist/chrome/icons/icon16.png"
    "dist/chrome/icons/icon48.png"
    "dist/chrome/icons/icon128.png"
)

chrome_ok=true
for file in "${chrome_check_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ 缺失: $file"
        chrome_ok=false
    fi
done

# 验证Edge版本
echo "📋 验证Edge版本文件..."
edge_check_files=(
    "dist/edge/manifest.json"
    "dist/edge/background.js"
    "dist/edge/content.js"
    "dist/edge/popup.js"
    "dist/edge/content.css"
    "dist/edge/popup.html"
    "dist/edge/browser-compat.js"
    "dist/edge/icons/icon16.png"
    "dist/edge/icons/icon48.png"
    "dist/edge/icons/icon128.png"
)

edge_ok=true
for file in "${edge_check_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ 缺失: $file"
        edge_ok=false
    fi
done

# 如果验证失败，退出
if [ "$chrome_ok" = false ] || [ "$edge_ok" = false ]; then
    echo "❌ 构建验证失败！"
    exit 1
fi

echo "✅ 构建结果验证通过"
echo ""

# 创建ZIP包
echo "📦 创建安装包..."
cd dist

# 生成Chrome版本ZIP
echo "📦 打包Chrome版本..."
if command -v zip >/dev/null 2>&1; then
    zip -r ../llm-assistant-chrome-v1.1.8.zip chrome/ -q
    if [ $? -eq 0 ]; then
        echo "✅ Chrome版本打包完成: llm-assistant-chrome-v1.1.8.zip"
    else
        echo "❌ Chrome版本打包失败"
        exit 1
    fi
else
    echo "⚠️  警告: 未找到zip命令"
    echo "    请手动压缩 dist/chrome 文件夹为 llm-assistant-chrome-v1.1.8.zip"
fi

# 生成Edge版本ZIP
echo "🔷 打包Edge版本..."
if command -v zip >/dev/null 2>&1; then
    zip -r ../llm-assistant-edge-v1.1.8.zip edge/ -q
    if [ $? -eq 0 ]; then
        echo "✅ Edge版本打包完成: llm-assistant-edge-v1.1.8.zip"
    else
        echo "❌ Edge版本打包失败"
        exit 1
    fi
else
    echo "    请手动压缩 dist/edge 文件夹为 llm-assistant-edge-v1.1.8.zip"
fi

cd ..

# 显示构建信息
echo ""
echo "🎉 构建完成！"
echo "📍 构建结果："
echo "   📁 Chrome源文件: dist/chrome/"
echo "   📁 Edge源文件: dist/edge/"

if command -v zip >/dev/null 2>&1; then
    echo "   📦 Chrome安装包: llm-assistant-chrome-v1.1.8.zip"
    echo "   📦 Edge安装包: llm-assistant-edge-v1.1.8.zip"
    echo ""
    echo "📊 安装包大小："
    if [ -f "llm-assistant-chrome-v1.1.8.zip" ]; then
  size=$(ls -lh llm-assistant-chrome-v1.1.8.zip | awk '{print $5}')
        echo "   Chrome版本: $size"
    fi
    if [ -f "llm-assistant-edge-v1.1.8.zip" ]; then
  size=$(ls -lh llm-assistant-edge-v1.1.8.zip | awk '{print $5}')
        echo "   Edge版本: $size"
    fi
fi

echo ""
echo "📋 下一步安装指南："
echo "Chrome浏览器:"
echo "  1. 打开 chrome://extensions/"
echo "  2. 启用右上角的'开发者模式'"
echo "  3. 点击'加载已解压的扩展程序'"
echo "  4. 选择 dist/chrome 文件夹"
echo ""
echo "Edge浏览器:"
echo "  1. 打开 edge://extensions/"
echo "  2. 启用右上角的'开发人员模式'"
echo "  3. 点击'加载解压缩的扩展'"
echo "  4. 选择 dist/edge 文件夹"
echo ""
echo "🎯 测试重点："
echo "  ✅ 扩展图标正常显示"
echo "  ✅ 点击图标打开设置弹窗"
echo "  ✅ 配置API Key"
echo "  ✅ 测试四大功能："
echo "     🔤 翻译、🤖 AI问答、✅ 语法检查、✨ 邮件润色"
echo "  ✅ 测试重新生成按钮"
echo ""
echo "✨ 构建脚本执行完毕！" 