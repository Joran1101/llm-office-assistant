# 贡献指南

感谢您对 LLM Office Assistant 项目的关注！我们欢迎所有形式的贡献。

## 🤝 如何贡献

### 报告问题

如果您发现了 bug 或有功能建议，请：

1. 检查 [Issues](../../issues) 页面，确保问题尚未被报告
2. 创建新的 Issue，并提供以下信息：
   - 详细的问题描述
   - 重现步骤
   - 预期行为
   - 实际行为
   - 浏览器版本和操作系统
   - 扩展版本

### 提交代码

1. **Fork 项目**
   ```bash
   git clone https://github.com/your-username/llm-office-assistant.git
   cd llm-office-assistant
   ```

2. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **进行开发**
   - 遵循现有的代码风格
   - 添加必要的注释
   - 确保代码通过测试

4. **测试您的更改**
   ```bash
   # 构建扩展
   ./build.sh
   
   # 在浏览器中加载测试
   # Chrome: chrome://extensions/
   # Edge: edge://extensions/
   ```

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```

6. **推送到您的 Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建 Pull Request**
   - 提供清晰的 PR 标题和描述
   - 说明更改的内容和原因
   - 链接相关的 Issues

## 📝 代码规范

### JavaScript/TypeScript

- 使用 2 空格缩进
- 使用分号结尾
- 使用 camelCase 命名变量和函数
- 使用 PascalCase 命名类和组件
- 添加 JSDoc 注释

### CSS

- 使用 kebab-case 命名类
- 按字母顺序排列属性
- 使用简写属性

### 提交信息

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式化
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

## 🧪 测试

在提交 PR 之前，请确保：

1. **功能测试**
   - 翻译功能正常工作
   - 语法检查功能正常工作
   - 邮件润色功能正常工作
   - AI 问答功能正常工作

2. **兼容性测试**
   - Chrome 88+ 版本
   - Microsoft Edge 88+ 版本
   - 不同操作系统（Windows、macOS、Linux）

3. **性能测试**
   - 扩展启动时间
   - 内存使用情况
   - 响应速度

## 🎨 UI/UX 指南

- 保持界面简洁直观
- 遵循现有的设计风格
- 确保在不同屏幕尺寸下的可用性
- 提供适当的用户反馈

## 📚 文档

如果您的更改影响用户界面或功能，请更新相关文档：

- README.md
- 安装指南
- 用户手册
- API 文档（如适用）

## 🔒 安全

如果您发现安全漏洞，请不要在公开的 Issues 中报告。请通过私人方式联系维护者。

## 📞 联系我们

如果您有任何问题或需要帮助，可以：

- 创建 Issue
- 发起 Discussion
- 联系项目维护者

## 📄 许可证

通过贡献代码，您同意您的贡献将在 [MIT License](LICENSE) 下发布。

---

再次感谢您的贡献！🎉