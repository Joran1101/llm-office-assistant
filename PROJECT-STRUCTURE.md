# 项目结构说明

## 📁 目录组织

### 核心文件
- `manifest.json` / `manifest.edge.json` - 扩展清单文件
- `background.js` - 后台服务脚本
- `content.js` / `content.css` - 内容脚本和样式
- `popup.html` / `popup.js` - 弹窗界面
- `browser-compat.js` - 浏览器兼容性处理
- `package.json` - 项目配置文件

### 资源目录
- `icons/` - 扩展图标文件
  - `icon16.png` - 16x16 工具栏图标
  - `icon48.png` - 48x48 扩展管理页图标
  - `icon128.png` - 128x128 Chrome Web Store图标

### 脚本目录 (`scripts/`)
- `build.sh` - 主构建脚本，生成Chrome和Edge版本
- `build-and-test.sh` - 构建并测试脚本
- `check-files.sh` - 文件完整性检查
- `validate-build.sh` - 构建结果验证
- `emergency-*.js` - 紧急修复脚本

### 测试目录 (`tests/`)
- `test.html` - 基础功能测试
- `test-clipboard-permission.html` - 剪贴板权限测试
- `test-multilingual.html` - 多语言功能测试
- `test-readability.html` - 可读性测试

### 文档目录 (`docs/`)
- `CHROME-INSTALL.md` - Chrome浏览器安装指南
- `EDGE-INSTALL.md` - Edge浏览器安装指南
- `EDGE-INSTALL-ENHANCED.md` - Edge增强版安装指南
- `CLIPBOARD-PERMISSIONS.md` - 剪贴板权限配置
- `ERROR-DIAGNOSIS.md` - 错误诊断指南
- `EXTENSION-CONTEXT-FIX.md` - 扩展上下文修复
- `UPDATES.md` - 更新日志
- `GITHUB-DEPLOY.md` - GitHub部署指南

### 配置文件
- `.env.example` - 环境变量模板
- `.gitignore` - Git忽略规则
- `SECURITY.md` - 安全配置指南
- `CONTRIBUTING.md` - 贡献指南
- `LICENSE` - MIT许可证

## 🚀 快速开始

1. **配置环境**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，添加API密钥
   ```

2. **构建扩展**
   ```bash
   ./scripts/build.sh
   ```

3. **验证构建**
   ```bash
   ./scripts/validate-build.sh
   ```

4. **运行测试**
   - 在浏览器中打开 `tests/` 目录下的测试文件
   - 或使用 `./scripts/build-and-test.sh` 自动化测试

## 📝 开发规范

- 所有脚本文件放在 `scripts/` 目录
- 测试文件放在 `tests/` 目录
- 文档文件放在 `docs/` 目录
- 核心功能文件保持在根目录
- 使用 `.env` 文件管理敏感配置
- 遵循 `CONTRIBUTING.md` 中的贡献规范