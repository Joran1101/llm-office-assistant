# GitHub 开源部署指南

## 🚀 快速开源到 GitHub

### 第一步：在 GitHub 创建仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `llm-office-assistant` 或您喜欢的名称
   - **Description**: `智能剪贴板助手 - 提供翻译、语法检查、邮件润色和AI问答功能`
   - **Visibility**: 选择 "Public"（公开）
   - ✅ 勾选 "Add a README file"
   - ✅ 选择 "MIT License"
   - ✅ 添加 ".gitignore" 模板（选择 "Node"）

### 第二步：连接本地仓库到 GitHub

```bash
# 添加远程仓库（替换为您的 GitHub 用户名和仓库名）
git remote add origin https://github.com/YOUR_USERNAME/llm-office-assistant.git

# 查看远程仓库配置
git remote -v

# 推送到 GitHub
git push -u origin main
```

### 第三步：验证部署

1. 访问您的 GitHub 仓库页面
2. 确认所有文件已正确上传
3. 检查 `.env.example` 文件存在
4. 确认 `SECURITY.md` 文件可访问
5. 验证 API 密钥未泄漏

## 🔍 安全检查清单

在推送到 GitHub 前，请确认：

- [ ] ✅ 所有硬编码的 API 密钥已移除
- [ ] ✅ `.env` 文件已添加到 `.gitignore`
- [ ] ✅ 创建了 `.env.example` 模板
- [ ] ✅ 添加了 `SECURITY.md` 安全指南
- [ ] ✅ README.md 包含安全提醒
- [ ] ✅ 代码中使用环境变量引用

## 📝 推荐的仓库设置

### 1. 启用安全功能

在 GitHub 仓库设置中启用：
- **Dependency graph**: 依赖关系图
- **Dependabot alerts**: 依赖安全警报
- **Secret scanning**: 密钥扫描
- **Code scanning**: 代码扫描

### 2. 设置分支保护

```bash
# 创建开发分支
git checkout -b develop
git push -u origin develop
```

在 GitHub 设置中：
- 保护 `main` 分支
- 要求 Pull Request 审查
- 要求状态检查通过

### 3. 添加 Issue 和 PR 模板

创建 `.github` 目录：
```bash
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p .github/PULL_REQUEST_TEMPLATE
```

## 🏷️ 发布版本

### 创建第一个发布版本

```bash
# 创建标签
git tag -a v1.0.0 -m "首次开源发布"

# 推送标签
git push origin v1.0.0
```

### 在 GitHub 创建 Release

1. 访问仓库的 "Releases" 页面
2. 点击 "Create a new release"
3. 选择刚创建的标签 `v1.0.0`
4. 填写发布说明
5. 上传构建好的扩展包（可选）

## 📊 项目推广

### 1. 完善项目描述

在 GitHub 仓库页面添加：
- 项目描述
- 网站链接
- 主题标签：`browser-extension`, `ai`, `translation`, `chrome-extension`

### 2. 创建项目展示

- 添加截图到 README
- 录制演示视频
- 创建 GitHub Pages 展示页面

### 3. 社区建设

- 启用 Discussions
- 创建贡献指南
- 设置行为准则
- 添加联系方式

## 🔄 持续集成

### GitHub Actions 工作流

创建 `.github/workflows/ci.yml`：

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm install
    - name: Run tests
      run: npm test
    - name: Build extension
      run: ./build.sh
```

## 📈 监控和维护

### 1. 设置通知

- 启用 Issue 和 PR 通知
- 关注安全警报
- 监控依赖更新

### 2. 定期维护

- 更新依赖包
- 修复安全漏洞
- 回应社区反馈
- 发布新版本

## 🆘 常见问题

### Q: 推送时提示权限被拒绝？

A: 检查 GitHub 认证：
```bash
# 使用 SSH（推荐）
git remote set-url origin git@github.com:YOUR_USERNAME/llm-office-assistant.git

# 或配置 Personal Access Token
```

### Q: 如何撤销已泄漏的 API 密钥？

A: 参考 [SECURITY.md](SECURITY.md) 中的应急处理步骤。

### Q: 如何处理大文件？

A: 使用 Git LFS 或将大文件移到外部存储。

---

🎉 **恭喜！您的项目现在已经开源到 GitHub 了！**

记得定期更新项目，与社区互动，让更多人受益于您的工作！