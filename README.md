# LLM Office Assistant

<div align="center">

![LLM Office Assistant](icons/icon128.png)

**智能剪贴板助手 - 提供翻译、语法检查、邮件润色和AI问答功能**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://chrome.google.com/webstore)
[![Microsoft Edge](https://img.shields.io/badge/Edge-Extension-green.svg)](https://microsoftedge.microsoft.com/addons)
[![GitHub stars](https://img.shields.io/github/stars/Joran1101/llm-office-assistant.svg)](https://github.com/Joran1101/llm-office-assistant/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Joran1101/llm-office-assistant.svg)](https://github.com/Joran1101/llm-office-assistant/issues)

[English](#english) | [中文](#中文)

</div>

## ⚠️ 重要安全提醒

**在使用本项目前，请务必阅读 [SECURITY.md](SECURITY.md) 了解如何安全配置 API 密钥！**

- 🔐 不要将真实的 API 密钥提交到版本控制
- 📝 使用 `.env` 文件或环境变量配置密钥
- 🛡️ 定期轮换 API 密钥

## ✨ 功能特性

- 🌍 **智能翻译**: 支持多语言互译，自动检测语言
- ✍️ **语法检查**: AI驱动的语法和拼写检查
- 📧 **邮件润色**: 专业邮件写作助手
- 🤖 **AI问答**: 基于DeepSeek的智能对话
- 📋 **剪贴板监控**: 自动处理复制的文本
- 🎨 **现代UI**: 简洁美观的用户界面
- 🔒 **隐私保护**: 本地处理，数据安全

## 🚀 快速开始

### 📦 安装方式

#### 方式一：从源码安装（推荐）

1. **克隆仓库**
   ```bash
   git clone https://github.com/Joran1101/llm-office-assistant.git
   cd llm-office-assistant
   ```

2. **配置API密钥**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入您的 DeepSeek API Key
   ```

3. **构建扩展**
   ```bash
   ./build.sh
   ```

4. **加载到浏览器**
   - Chrome: 访问 `chrome://extensions/`，启用开发者模式，点击"加载已解压的扩展程序"，选择 `dist/chrome` 文件夹
   - Edge: 访问 `edge://extensions/`，启用开发者模式，点击"加载解压缩的扩展"，选择 `dist/edge` 文件夹

#### 方式二：下载预构建版本

从 [Releases](https://github.com/Joran1101/llm-office-assistant/releases) 页面下载最新版本的 `.zip` 文件。

### 🔑 API密钥配置

1. 访问 [DeepSeek开放平台](https://platform.deepseek.com/)
2. 注册账户并获取API密钥
3. 在扩展弹窗中点击设置，输入API密钥
4. 点击测试连接确认配置正确

## 🌐 浏览器支持

✅ **Chrome** 88+ (推荐)  
✅ **Microsoft Edge** 88+ (原生支持，增强功能)  
✅ **其他Chromium内核浏览器**

### Edge版本特色
- 🚀 **性能优化**: 针对Edge内核深度优化
- 💾 **更大存储**: 支持1MB同步存储空间
- 🔒 **增强安全**: 集成Microsoft Defender保护
- 🏢 **企业支持**: 兼容组策略管理

## 📖 使用指南

### 基本操作

1. **复制文本**: 复制任意文本到剪贴板
2. **选择功能**: 点击扩展图标，选择所需功能
3. **查看结果**: AI处理结果将显示在弹窗中
4. **复制结果**: 点击复制按钮保存处理结果

### 功能详解

- **翻译**: 自动检测语言并翻译为目标语言
- **语法检查**: 检查并修正语法、拼写错误
- **邮件润色**: 将文本润色为专业邮件格式
- **AI问答**: 与AI助手进行智能对话

## 🛠️ 开发指南

### 项目结构

```
llm-office-assistant/
├── manifest.json          # Chrome扩展清单
├── manifest.edge.json     # Edge扩展清单
├── background.js          # 后台脚本
├── content.js            # 内容脚本
├── popup.html/js         # 弹窗界面
├── icons/                # 图标文件
├── dist/                 # 构建输出
└── docs/                 # 文档文件
```

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm test
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

### 快速贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/Joran1101/llm-office-assistant.git
cd llm-office-assistant

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，添加您的 API 密钥

# 构建扩展
./build.sh
```

## 🔧 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **API**: DeepSeek Chat API
- **存储**: Chrome Storage API
- **权限**: Chrome Extensions API
- **构建**: Shell Scripts

## 📊 项目统计

- 🎯 **功能**: 4个核心AI功能
- 🌐 **浏览器**: 支持Chrome 88+, Edge 88+
- 📦 **大小**: < 1MB
- ⚡ **性能**: 响应时间 < 2秒
- 🔒 **安全**: 本地处理，API密钥加密存储

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔒 安全说明

- 🔐 API密钥采用本地加密存储
- 🛡️ 不收集用户个人信息
- 🌐 仅在必要时访问网页内容
- 📝 详细安全配置请参考 [SECURITY.md](SECURITY.md)

## 🙏 致谢

- [DeepSeek](https://www.deepseek.com/) - 提供强大的AI模型支持
- 所有贡献者和用户的支持
- 开源社区的宝贵建议

## 📞 联系我们

- 🐛 问题反馈: [GitHub Issues](https://github.com/Joran1101/llm-office-assistant/issues)
- 💬 功能讨论: [GitHub Discussions](https://github.com/Joran1101/llm-office-assistant/discussions)
- 📧 邮箱联系: 通过GitHub联系

## 🌟 Star History

如果这个项目对您有帮助，请给我们一个 ⭐️！

[![Star History Chart](https://api.star-history.com/svg?repos=Joran1101/llm-office-assistant&type=Date)](https://star-history.com/#Joran1101/llm-office-assistant&Date)

---

<div align="center">

**[⬆ 回到顶部](#llm-office-assistant)**

 Made with ❤️ by [Joran1101](https://github.com/Joran1101)

</div>