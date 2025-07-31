// Service Worker - 后台服务脚本
class LLMAssistantService {
  constructor() {
    this.emailDomains = [
      'mail.google.com',
      'outlook.live.com', 
      'outlook.office.com',
      'mail.yahoo.com',
      'mail.163.com',
      'mail.qq.com',
      'gmail.com'
    ];
    
    this.initEventListeners();
    this.checkApiKey(); // 启动时检查API Key
    console.log('🤖 LLM Assistant Service 已启动');
  }

  async checkApiKey() {
    try {
      const { apiKey } = await chrome.storage.sync.get('apiKey');
      if (apiKey) {
        console.log('✅ API Key 已配置，长度:', apiKey.length);
      } else {
        console.log('⚠️ 未配置API Key');
      }
    } catch (error) {
      console.error('检查API Key失败:', error);
    }
  }

  initEventListeners() {
    // 监听来自content script的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📨 收到消息:', message.action, sender.tab?.url);
      this.handleMessage(message, sender, sendResponse);
      return true; // 保持消息通道开放以支持异步响应
    });

    // 监听Tab更新，检测邮件页面
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    // 监听扩展安装
    chrome.runtime.onInstalled.addListener(async () => {
      console.log('🎉 LLM Assistant 扩展已安装');
      
      // 安装时自动配置API Key
      try {
        const { apiKey } = await chrome.storage.sync.get('apiKey');
        if (!apiKey) {
          const presetKey = process.env.DEEPSEEK_API_KEY || 'your-deepseek-api-key-here';
          await chrome.storage.sync.set({ apiKey: presetKey });
          console.log('🚀 自动配置API Key完成');
        }
      } catch (error) {
        console.error('自动配置API Key失败:', error);
      }
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'getTabId':
          sendResponse({ tabId: sender.tab.id });
          break;
          
        case 'showPrompt':
          await this.handleShowPrompt(message, sender);
          sendResponse({ success: true });
          break;
          
        case 'processText':
          console.log('🔄 开始处理文本:', message.action_type);
          const result = await this.processTextWithLLM(message.action_type, message.text);
          console.log('✅ 文本处理完成');
          sendResponse({ success: true, result });
          break;
          
        default:
          console.warn('❓ 未知操作:', message.action);
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('❌ 处理消息时出错:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
      const isEmailPage = this.emailDomains.some(domain => tab.url.includes(domain));
      if (isEmailPage) {
        console.log('📧 检测到邮件页面:', tab.url);
        chrome.tabs.sendMessage(tabId, { 
          action: 'isEmailPage', 
          emailDetected: true 
        }).catch((error) => {
          // 忽略无法发送消息的错误（页面可能还未加载完成）
          console.log('📧 邮件页面消息发送失败，页面可能未准备就绪');
        });
      }
    }
  }

  async handleShowPrompt(message, sender) {
    // 指示content script显示提示框
    chrome.tabs.sendMessage(sender.tab.id, {
      action: 'displayPrompt',
      text: message.text
    });
  }

  async processTextWithLLM(actionType, text, conversationHistory = null) {
    console.log('🔑 获取API Key...');
    const result = await chrome.storage.sync.get('apiKey');
    const apiKey = result.apiKey;
    
    console.log('API Key 状态:', apiKey ? `已配置 (长度: ${apiKey.length})` : '未配置');
    
    if (!apiKey) {
      throw new Error('请先在插件设置中配置DeepSeek API Key');
    }

    const messages = this.buildMessages(actionType, text, conversationHistory);
    console.log('💬 构建消息:', messages);
    
    try {
      console.log('🌐 调用DeepSeek API...');
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          stream: false,
          temperature: conversationHistory ? 0.7 : 0.3, // 多轮对话使用更高的创造性
          max_tokens: conversationHistory ? 3000 : 2000  // 多轮对话允许更长回复
        })
      });

      console.log('📡 API响应状态:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🚫 API错误:', errorData);
        throw new Error(`API调用失败 (${response.status}): ${errorData.error?.message || errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('📄 API响应数据:', data);
      
      const result = data.choices[0].message.content;
      console.log('✨ 处理结果:', result.substring(0, 100) + '...');
      
      return result;
    } catch (error) {
      console.error('💥 DeepSeek API调用错误:', error);
      
      // 提供更友好的错误信息
      if (error.message.includes('401')) {
        throw new Error('API Key无效，请检查配置');
      } else if (error.message.includes('403')) {
        throw new Error('API访问被拒绝，请检查账户状态');
      } else if (error.message.includes('429')) {
        throw new Error('请求过于频繁，请稍后重试');
      } else if (error.message.includes('500')) {
        throw new Error('服务器错误，请稍后重试');
      } else {
        throw new Error(`文本处理失败: ${error.message}`);
      }
    }
  }

  buildMessages(actionType, text, conversationHistory = null) {
    const systemPrompts = {
      translate: "你是一个专业的翻译助手。请将以下英文文本准确、流畅地翻译成中文，保持原文的语气和风格。直接返回翻译结果，不需要额外说明。",
      grammar_check: "你是一个专业的英文语法检查器。请仔细检查以下文本中的语法、拼写和标点错误，并提供修正后的完整文本。如果没有错误，请回复原文。只返回修正后的文本，不需要额外说明。",
      email_refine: "你是一个专业的商务邮件助手。请优化以下邮件内容，使其更加专业、礼貌和清晰，同时保持原意不变。注意邮件的语气要适中，既不过于正式也不过于随意。只返回优化后的邮件内容，不需要额外说明。",
      ask_ai: "你是一个专业的AI助手。用户会提供一段参考内容和相关问题，请基于参考内容回答用户的问题。回答要准确、详细、有帮助，使用中文回复。如果问题与参考内容无关，请礼貌地说明并尽力提供有用的信息。"
    };

    // 如果是多轮对话模式（有历史记录）
    if (conversationHistory && conversationHistory.length > 0) {
      return conversationHistory;
    }

    // 传统单轮模式
    return [
      {
        "role": "system",
        "content": systemPrompts[actionType] || "请处理以下文本内容。"
      },
      {
        "role": "user", 
        "content": text
      }
    ];
  }
}

// 初始化服务
new LLMAssistantService();