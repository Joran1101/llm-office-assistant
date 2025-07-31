export class LLMService {
  private apiKey: string | null = null;

  constructor() {
    this.loadApiKey();
  }

  private async loadApiKey() {
    // 从本地存储加载API Key
    this.apiKey = localStorage.getItem('deepseek_api_key');
  }

  public setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('deepseek_api_key', apiKey);
  }

  public async processText(actionType: string, text: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('请先配置DeepSeek API Key');
    }

    const messages = this.buildMessages(actionType, text);

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          stream: false,
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API调用失败 (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      if (error.message.includes('401')) {
        throw new Error('API Key无效，请检查配置');
      } else if (error.message.includes('403')) {
        throw new Error('API访问被拒绝，请检查账户状态');
      } else if (error.message.includes('429')) {
        throw new Error('请求过于频繁，请稍后重试');
      } else {
        throw new Error(`文本处理失败: ${error.message}`);
      }
    }
  }

  private buildMessages(actionType: string, text: string) {
    const systemPrompts = {
      translate: "你是一个专业的翻译助手。请将以下英文文本准确、流畅地翻译成中文，保持原文的语气和风格。直接返回翻译结果，不需要额外说明。",
      grammar_check: "你是一个专业的英文语法检查器。请仔细检查以下文本中的语法、拼写和标点错误，并提供修正后的完整文本。如果没有错误，请回复原文。只返回修正后的文本，不需要额外说明。",
      email_refine: "你是一个专业的商务邮件助手。请优化以下邮件内容，使其更加专业、礼貌和清晰，同时保持原意不变。注意邮件的语气要适中，既不过于正式也不过于随意。只返回优化后的邮件内容，不需要额外说明。",
      ask_ai: "你是一个专业的AI助手。用户会提供一段参考内容和相关问题，请基于参考内容回答用户的问题。回答要准确、详细、有帮助，使用中文回复。"
    };

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