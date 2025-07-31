# 🔧 Extension Context 错误修复指南

## 问题描述

当您看到 `"Extension context invalidated"` 错误时，这表示浏览器扩展的上下文已失效。这通常发生在：

- 🔄 扩展被重新加载或更新
- ⚙️ 浏览器扩展设置被修改  
- 🔁 开发者模式下重新加载扩展
- 🆙 扩展版本更新后

## 快速修复方法

### 方法一：刷新页面（推荐）
1. 按 `F5` 或 `Ctrl+R` (Windows) / `Cmd+R` (Mac) 刷新当前页面
2. 重新测试扩展功能

### 方法二：重新加载扩展
1. 打开浏览器扩展管理页面：
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
2. 找到 "LLM Office Assistant" 扩展
3. 点击 🔄 重新加载按钮
4. 刷新当前页面

### 方法三：控制台紧急修复
如果上述方法无效，可以在浏览器控制台运行紧急修复脚本：

1. 按 `F12` 打开开发者工具
2. 切换到 `Console` 标签
3. 复制粘贴以下代码并回车：

```javascript
// 紧急修复脚本
(function() {
  console.log('🔧 清理扩展残留...');
  
  // 移除扩展UI元素
  ['.llm-assistant-conversation', '.llm-assistant-overlay', '.llm-assistant-prompt', '.llm-assistant-result'].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.remove());
  });
  
  // 清理全局变量
  if (window.llmAssistant) window.llmAssistant = null;
  
  console.log('✅ 清理完成，正在刷新页面...');
  setTimeout(() => location.reload(), 1000);
})();
```

## 预防措施

为了减少此类错误的发生：

1. **避免频繁重新加载扩展**：只在必要时重新加载
2. **等待更新完成**：扩展更新时等待完全安装完成
3. **关闭无关标签页**：减少内存占用和上下文冲突
4. **定期重启浏览器**：清理内存和扩展状态

## 错误详情

扩展现在包含了增强的错误处理机制：

- ✅ **自动检测**：每次操作前检查上下文有效性
- ✅ **友好提示**：显示详细的错误信息和解决建议
- ✅ **自动恢复**：尝试重新初始化失效的连接
- ✅ **降级处理**：在无法恢复时提供替代方案

## 技术说明

Extension Context 失效是 Chrome 扩展开发中的常见问题，主要原因是：

- **Service Worker 重启**：后台脚本被浏览器回收
- **内容脚本孤立**：页面中的脚本无法与后台通信
- **权限变更**：扩展权限或设置发生变化

我们的修复版本添加了：
- 上下文有效性检查
- 存储访问异常处理  
- 用户友好的错误提示
- 自动重试和降级机制

## 联系支持

如果问题持续存在，请：

1. 📝 记录错误发生的具体场景
2. 🖼️ 截图保存错误信息
3. 📧 联系开发者并提供详细信息

---

*本指南适用于 LLM Office Assistant v1.1.6+* 