# LLM Office Assistant

智能剪贴板助手 - 提供翻译、语法检查、邮件润色和AI问答功能

## ⚠️ 重要安全提醒

**在使用本项目前，请务必阅读 [SECURITY.md](SECURITY.md) 了解如何安全配置 API 密钥！**

- 🔐 不要将真实的 API 密钥提交到版本控制
- 📝 使用 `.env` 文件或环境变量配置密钥
- 🛡️ 定期轮换 API 密钥

## 🌐 浏览器支持

✅ **Chrome** 88+ (推荐)  
✅ **Microsoft Edge** 88+ (原生支持，增强功能)  
✅ **其他Chromium内核浏览器**

### Edge版本特色
- 🚀 **性能优化**: 针对Edge内核深度优化
- 💾 **更大存储**: 支持1MB同步存储空间
- 🔒 **增强安全**: 集成Microsoft Defender保护
- 🏢 **企业支持**: 兼容组策略管理

## 📦 项目结构

```
chrome_llm/
├── README.md
├── .gitignore
├── browser-extension/          # 浏览器插件代码
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── content.css
│   ├── popup.html
│   ├── popup.js
│   ├── test.html
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
└── desktop-app/               # Mac桌面应用代码
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.main.json
    ├── tsconfig.renderer.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── electron-builder.config.js
    ├── src/
    │   ├── main/
    │   │   └── main.ts
    │   ├── preload/
    │   │   └── preload.ts
    │   └── renderer/
    │       ├── index.html
    │       ├── App.tsx
    │       ├── main.tsx
    │       ├── components/
    │       │   ├── ClipboardMonitor.tsx
    │       │   ├── QuickActionPanel.tsx
    │       │   ├── SettingsPanel.tsx
    │       │   ├── ResultDisplay.tsx
    │       │   ├── NotificationToast.tsx
    │       │   └── QuestionInputPanel.tsx
    │       ├── services/
    │       │   └── LLMService.ts
    │       └── styles/
    │           └── globals.css
    ├── assets/
    │   ├── icon.icns
    │   ├── tray-icon.png
    │   └── dmg-background.png
    └── dist/                  # 构建输出目录
```

## 第一步：移动现有插件文件

首先，让我们将现有的插件文件移动到 `browser-extension` 文件夹中：

```bash
# 创建目录结构
mkdir -p browser-extension/icons
mkdir -p desktop-app/src/{main,preload,renderer/{components,services,styles}}
mkdir -p desktop-app/assets

# 移动现有插件文件到 browser-extension 文件夹
```

## 第二步：更新项目根目录的README.md

```markdown:README.md
<code_block_to_apply_changes_from>
```
chrome_llm
``` 
```
</code_block_to_apply_changes_from>

## 🎨 图标设计

新版本采用可爱的机器人图标，体现AI助手的智能和亲和力：
- 🤖 **设计理念**: 友好的AI助手形象
- 🎨 **风格**: 卡通风格，色彩鲜明
- 📐 **规格**: 支持16x16、48x48、128x128多种尺寸
- 🔍 **优化**: 针对小尺寸显示优化，保持清晰度

## 🎯 接下来需要完成的步骤

### 1. 更新 Chrome 版本的 manifest.json

```json:browser-extension/manifest.json
{
  "name": "LLM Office Assistant",
  "version": "1.1.2",
  "description": "智能剪贴板助手：自动翻译、语法检查和邮件润色",
  "manifest_version": 3,
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
    "tabs"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["browser-compat.js", "content.js"],
      "css": ["content.css"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### 2. 确认图标文件结构

确保您的 `icons/` 文件夹有以下结构：
```
browser-extension/
├── icons/
│   ├── icon16.png    (16x16像素)
│   ├── icon48.png    (48x48像素)
│   └── icon128.png   (128x128像素)
├── manifest.json
├── manifest.edge.json
└── ... 其他文件
```

### 3. 更新构建脚本以包含新图标

```bash:browser-extension/build.sh
#!/bin/bash

# 创建构建目录
mkdir -p dist/chrome dist/edge

echo "🎨 复制图标文件..."
# 复制图标文件到两个版本
cp -r icons/ dist/chrome/
cp -r icons/ dist/edge/

echo "📦 构建Chrome版本..."
# 复制Chrome版本文件
cp manifest.json dist/chrome/
cp *.js dist/chrome/
cp *.css dist/chrome/
cp *.html dist/chrome/

echo "🌐 构建Edge版本..."
# 复制Edge版本文件
cp manifest.edge.json dist/edge/manifest.json
cp *.js dist/edge/
cp *.css dist/edge/
cp *.html dist/edge/

echo "📁 创建分发包..."
# 创建ZIP包
cd dist
zip -r ../llm-assistant-chrome-v1.1.2.zip chrome/
zip -r ../llm-assistant-edge-v1.1.2.zip edge/
cd ..

echo "✅ 构建完成！"
echo "📦 Chrome版本: llm-assistant-chrome-v1.1.2.zip"
echo "📦 Edge版本: llm-assistant-edge-v1.1.2.zip"
```

### 4. 更新版本号

您的 Edge manifest 中版本还是 "1.0.0"，建议统一更新：

```json:browser-extension/manifest.edge.json
{
  "name": "LLM Office Assistant",
  "version": "1.1.2",
  "description": "智能剪贴板助手：自动翻译、语法检查和邮件润色 - Edge版",
  // ... existing code ...
}
```

### 5. 测试新图标

更新完成后，测试步骤：

1. **重新加载扩展**：
   - Chrome: 前往 `chrome://extensions/`，点击刷新按钮
   - Edge: 前往 `edge://extensions/`，点击刷新按钮

2. **验证图标显示**：
   - 检查工具栏是否显示新的机器人图标
   - 检查扩展管理页面的图标
   - 确认弹窗页面的图标显示

3. **功能测试**：
   - 测试所有核心功能是否正常
   - 确认图标点击能正常打开弹窗

### 完整构建流程：
# 1. 确保在正确目录
cd browser-extension

# 2. 确认目录内容
ls -la

# 3. 创建和授权脚本（如果需要）
chmod +x *.sh

# 4. 检查文件
./check-files.sh

# 5. 执行构建
./build.sh

### 6. 更新文档中的图标信息

```markdown:browser-extension/README.md
<code_block_to_apply_changes_from>
```

##