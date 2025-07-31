// 🚨 紧急修复脚本 - 在浏览器控制台运行
// 如果扩展出现 "Extension context invalidated" 错误，请执行此脚本

console.log('🚀 开始执行紧急修复...');

// 1. 移除所有现有的扩展UI元素
function removeExtensionElements() {
  const elements = [
    '.llm-assistant-prompt',
    '.llm-assistant-overlay', 
    '.llm-assistant-result',
    '.llm-assistant-question'
  ];
  
  elements.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.remove());
  });
  console.log('✅ 清理旧UI元素完成');
}

// 2. 检查扩展状态
function checkExtensionStatus() {
  try {
    if (chrome && chrome.runtime && chrome.runtime.id) {
      console.log('✅ 扩展上下文正常');
      return true;
    } else {
      console.log('❌ 扩展上下文失效');
      return false;
    }
  } catch (error) {
    console.log('❌ 扩展上下文失效:', error.message);
    return false;
  }
}

// 3. 显示友好提示
function showFriendlyNotification() {
  // 移除现有通知
  document.querySelectorAll('.emergency-fix-notification').forEach(el => el.remove());
  
  const notification = document.createElement('div');
  notification.className = 'emergency-fix-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f8d7da;
    color: #721c24;
    padding: 16px 20px;
    border-radius: 8px;
    border: 1px solid #f5c6cb;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    max-width: 300px;
    line-height: 1.4;
  `;
  
  notification.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 8px;">🔄 扩展需要更新</div>
    <div style="margin-bottom: 12px;">扩展已更新，请按以下步骤操作：</div>
    <div style="font-size: 13px; color: #495057;">
      1. 刷新扩展 (chrome://extensions/)<br>
      2. 刷新此页面 (Ctrl+F5)<br>
      3. 重新尝试功能
    </div>
    <button onclick="this.parentElement.remove()" style="
      margin-top: 10px;
      background: #6c757d;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    ">关闭</button>
  `;
  
  document.body.appendChild(notification);
  
  // 10秒后自动消失
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
  
  console.log('✅ 友好提示已显示');
}

// 4. 执行修复
function executeEmergencyFix() {
  removeExtensionElements();
  
  if (!checkExtensionStatus()) {
    showFriendlyNotification();
    console.log('🎯 紧急修复完成！请按提示操作。');
  } else {
    console.log('🎉 扩展状态正常，无需修复！');
  }
}

// 执行修复
executeEmergencyFix();

// 5. 监听后续的扩展错误
const originalConsoleError = console.error;
console.error = function(...args) {
  if (args.some(arg => 
    typeof arg === 'string' && 
    arg.includes('Extension context invalidated')
  )) {
    console.log('🚨 检测到扩展上下文错误，显示友好提示...');
    showFriendlyNotification();
  }
  return originalConsoleError.apply(console, args);
};

console.log('🎯 紧急修复脚本安装完成！如果再次出现错误，会自动显示友好提示。'); 