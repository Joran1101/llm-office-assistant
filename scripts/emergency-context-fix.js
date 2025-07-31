// LLM Assistant 紧急修复脚本
// 当遇到 "Extension context invalidated" 错误时运行

(function() {
  console.log('🔧 LLM Assistant 紧急修复脚本开始...');
  
  // 移除所有扩展相关的DOM元素
  const elementsToRemove = [
    '.llm-assistant-conversation',
    '.llm-assistant-overlay',
    '.llm-assistant-prompt',
    '.llm-assistant-result'
  ];
  
  elementsToRemove.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      console.log(`移除元素: ${selector}`);
      el.remove();
    });
  });
  
  // 清理全局事件监听器
  try {
    // 移除复制事件监听器
    document.removeEventListener('copy', window.llmAssistantCopyHandler);
    console.log('✅ 已清理复制事件监听器');
  } catch (e) {
    console.log('⚠️ 清理复制事件监听器失败，但这是正常的');
  }
  
  // 清理选择事件监听器
  try {
    document.removeEventListener('selectionchange', window.llmAssistantSelectionHandler);
    console.log('✅ 已清理选择事件监听器');
  } catch (e) {
    console.log('⚠️ 清理选择事件监听器失败，但这是正常的');
  }
  
  // 清理键盘事件监听器
  try {
    document.removeEventListener('keydown', window.llmAssistantKeyHandler);
    console.log('✅ 已清理键盘事件监听器');
  } catch (e) {
    console.log('⚠️ 清理键盘事件监听器失败，但这是正常的');
  }
  
  // 清理全局变量
  if (window.llmAssistant) {
    window.llmAssistant = null;
    console.log('✅ 已清理全局变量');
  }
  
  console.log('🎉 紧急修复完成！现在刷新页面...');
  
  // 延迟刷新，让用户看到清理结果
  setTimeout(() => {
    location.reload();
  }, 1000);
  
})(); 