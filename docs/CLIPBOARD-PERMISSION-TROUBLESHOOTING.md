# 🔒 剪切板权限故障排除指南

## 问题描述
当复制文字时，LLM Assistant 的权限请求对话框没有弹出。

## 🔍 诊断步骤

### 第1步：检查扩展状态
1. 打开 Chrome 扩展管理页面：`chrome://extensions/`
2. 确认 LLM Assistant 扩展：
   - ✅ 已安装
   - ✅ 已启用
   - ✅ 有权限在当前网站运行

### 第2步：检查控制台日志
1. 按 `F12` 打开开发者工具
2. 切换到 `Console` 标签页
3. 复制一段文字
4. 查看是否有以下日志：
   ```
   📋 检测到复制事件
   🔍 开始处理复制内容，当前权限状态: false
   🔒 需要请求剪切板权限
   📋 显示权限请求对话框
   ```

### 第3步：使用测试页面
1. 打开测试页面：`test-clipboard-permission.html`
2. 点击测试文本进行复制
3. 观察日志输出
4. 检查权限状态

## 🛠️ 常见问题与解决方案

### 问题1：没有任何控制台日志
**可能原因：** 扩展没有正确加载

**解决方案：**
```bash
1. 刷新页面 (F5)
2. 重新加载扩展：
   - 进入 chrome://extensions/
   - 点击扩展右下角的"刷新"按钮
3. 检查扩展错误：
   - 在扩展管理页面查看是否有错误
```

### 问题2：有"检测到复制事件"但没有权限请求
**可能原因：** 权限逻辑错误

**解决方案：**
```bash
1. 清除扩展存储：
   - 打开 chrome://extensions/
   - 点击扩展详情
   - 点击"删除扩展数据"
2. 重新加载扩展
3. 再次测试
```

### 问题3：权限对话框一闪而过
**可能原因：** 权限请求时机错误

**解决方案：**
```bash
1. 检查是否有其他扩展冲突
2. 在隐身模式下测试
3. 重置扩展状态
```

### 问题4：浏览器不支持剪切板API
**可能原因：** 浏览器版本过旧或不支持

**解决方案：**
```bash
1. 更新浏览器到最新版本
2. 确保在 HTTPS 页面上测试
3. 检查浏览器是否支持 navigator.clipboard API
```

## 🔧 手动修复步骤

### 方法1：重置扩展状态
```javascript
// 在控制台执行以下代码
chrome.storage.local.clear().then(() => {
    console.log('扩展存储已清除');
    location.reload();
});
```

### 方法2：手动触发权限请求
```javascript
// 在控制台执行以下代码
if (window.llmAssistant) {
    window.llmAssistant.clipboardPermissionGranted = false;
    window.llmAssistant.clipboardPermissionRequested = false;
    window.llmAssistant.requestClipboardPermission().then(result => {
        console.log('权限请求结果:', result);
    });
}
```

### 方法3：检查权限状态
```javascript
// 在控制台执行以下代码
navigator.permissions.query({name: 'clipboard-read'}).then(permission => {
    console.log('当前权限状态:', permission.state);
});
```

## 📊 Debug 模式启用

在 `content.js` 文件顶部添加以下代码启用详细日志：
```javascript
window.LLM_DEBUG = true;
```

## 🚨 紧急恢复方案

如果以上方法都无效，请尝试：

1. **完全重新安装扩展：**
   - 删除扩展
   - 重启浏览器
   - 重新安装扩展

2. **使用备用测试：**
   - 打开 `test-clipboard-permission.html`
   - 使用"重置扩展状态"按钮
   - 观察实时日志

3. **联系支持：**
   - 提供控制台错误信息
   - 说明浏览器版本和操作系统
   - 描述具体的操作步骤

## 📋 检查清单

在报告问题前，请确认以下项目：

- [ ] 扩展已正确安装和启用
- [ ] 在支持的网站上测试（HTTPS）
- [ ] 浏览器版本支持剪切板API
- [ ] 没有其他扩展冲突
- [ ] 已尝试重新加载扩展
- [ ] 已查看控制台错误日志
- [ ] 已尝试隐身模式
- [ ] 已清除扩展存储并重试

## 📝 版本信息

- **扩展版本：** 1.1.7+
- **支持浏览器：** Chrome 88+, Edge 88+
- **最低系统：** macOS 10.15+, Windows 10+

---

如果问题仍然存在，请查看控制台完整日志并联系技术支持。 