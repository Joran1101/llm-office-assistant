# 安全配置指南

## 🔐 API 密钥安全

### 重要提醒

⚠️ **绝对不要将真实的 API 密钥提交到版本控制系统中！**

### 配置步骤

1. **复制环境变量模板**
   ```bash
   cp .env.example .env
   ```

2. **编辑 .env 文件**
   ```bash
   # 编辑 .env 文件，填入您的真实 API 密钥
   DEEPSEEK_API_KEY=sk-your-actual-api-key-here
   ```

3. **验证 .gitignore**
   确保 `.env` 文件已被 `.gitignore` 忽略：
   ```bash
   git status
   # .env 文件不应出现在待提交列表中
   ```

### 开发环境配置

#### 方法一：环境变量（推荐）

```bash
# 在终端中设置环境变量
export DEEPSEEK_API_KEY="sk-your-actual-api-key-here"

# 或者添加到 ~/.zshrc 或 ~/.bashrc
echo 'export DEEPSEEK_API_KEY="sk-your-actual-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

#### 方法二：本地配置文件

创建 `config.local.js`（已在 .gitignore 中）：
```javascript
// config.local.js
window.LOCAL_CONFIG = {
  DEEPSEEK_API_KEY: 'sk-your-actual-api-key-here'
};
```

### 生产环境部署

1. **Chrome Web Store**
   - 不需要在扩展包中包含 API 密钥
   - 用户需要自行配置 API 密钥

2. **企业部署**
   - 使用组策略管理 API 密钥
   - 或通过企业配置服务器分发

### 安全检查清单

- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] 代码中没有硬编码的 API 密钥
- [ ] 使用环境变量或安全的配置管理
- [ ] 定期轮换 API 密钥
- [ ] 监控 API 密钥使用情况

### 如果 API 密钥泄漏了怎么办？

1. **立即撤销泄漏的密钥**
   - 登录 [DeepSeek 平台](https://platform.deepseek.com/)
   - 删除或禁用泄漏的 API 密钥

2. **生成新的 API 密钥**
   - 创建新的 API 密钥
   - 更新所有使用该密钥的应用

3. **检查使用记录**
   - 查看 API 使用日志
   - 确认是否有异常使用

4. **更新安全措施**
   - 检查代码仓库历史
   - 加强访问控制

### 最佳实践

1. **最小权限原则**
   - 只授予必要的 API 权限
   - 定期审查权限设置

2. **密钥轮换**
   - 定期更换 API 密钥
   - 建立密钥轮换流程

3. **监控和告警**
   - 监控 API 使用量
   - 设置异常使用告警

4. **团队协作**
   - 团队成员使用各自的 API 密钥
   - 不要共享个人 API 密钥

### 联系我们

如果发现安全问题，请通过以下方式联系：
- 创建 Issue（不要包含敏感信息）
- 发送邮件到项目维护者

---

**记住：安全是每个人的责任！** 🛡️