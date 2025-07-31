import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clipboard, Settings, MessageSquare, Languages, CheckCircle, Mail, Brain } from 'lucide-react';
import { LLMService } from './services/LLMService';
import { ClipboardMonitor } from './components/ClipboardMonitor';
import { QuickActionPanel } from './components/QuickActionPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { ResultDisplay } from './components/ResultDisplay';
import { NotificationToast } from './components/NotificationToast';

interface ProcessResult {
  action: string;
  originalText: string;
  result: string;
}

const App: React.FC = () => {
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [clipboardText, setClipboardText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const navigate = useNavigate();

  const llmService = new LLMService();

  useEffect(() => {
    // 监听来自主进程的快速操作
    window.electronAPI.onQuickAction(handleQuickAction);
    
    // 监听导航事件
    window.electronAPI.onNavigateTo((route) => {
      navigate(route);
    });

    // 监听通知
    window.electronAPI.onShowNotification(showNotification);

    return () => {
      window.electronAPI.removeAllListeners('quick-action');
      window.electronAPI.removeAllListeners('navigate-to');
      window.electronAPI.removeAllListeners('show-notification');
    };
  }, [navigate]);

  const handleQuickAction = async (data: { action: string; text: string }) => {
    setClipboardText(data.text);
    setCurrentAction(data.action);
    
    if (data.action === 'ask_ai') {
      // 对于问AI功能，显示问题输入界面
      return;
    }
    
    await processText(data.action, data.text);
  };

  const processText = async (action: string, text: string) => {
    setIsProcessing(true);
    setResult(null);

    try {
      const processedText = await llmService.processText(action, text);
      setResult({
        action,
        originalText: text,
        result: processedText
      });
    } catch (error) {
      showNotification(`处理失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await window.electronAPI.setClipboardText(text);
      showNotification('已复制到剪贴板');
    } catch (error) {
      showNotification('复制失败');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* 标题栏 */}
      <div className="flex-shrink-0 h-16 bg-white/70 backdrop-blur-lg border-b border-gray-200 flex items-center justify-between px-6 drag-region">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-800">LLM Office Assistant</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={
            <MainPanel
              currentAction={currentAction}
              clipboardText={clipboardText}
              isProcessing={isProcessing}
              result={result}
              onProcessText={processText}
              onCopyToClipboard={copyToClipboard}
              onShowNotification={showNotification}
            />
          } />
          <Route path="/settings" element={<SettingsPanel />} />
        </Routes>
      </div>

      {/* 通知组件 */}
      <AnimatePresence>
        {notification && (
          <NotificationToast
            message={notification}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const MainPanel: React.FC<{
  currentAction: string | null;
  clipboardText: string;
  isProcessing: boolean;
  result: ProcessResult | null;
  onProcessText: (action: string, text: string) => void;
  onCopyToClipboard: (text: string) => void;
  onShowNotification: (message: string) => void;
}> = ({
  currentAction,
  clipboardText,
  isProcessing,
  result,
  onProcessText,
  onCopyToClipboard,
  onShowNotification
}) => {
  return (
    <div className="h-full flex">
      {/* 左侧面板 */}
      <div className="w-80 bg-white/50 backdrop-blur-lg border-r border-gray-200 p-6">
        <ClipboardMonitor onTextDetected={onShowNotification} />
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">快速功能</h3>
          <QuickActionPanel
            onAction={(action) => {
              if (clipboardText) {
                onProcessText(action, clipboardText);
              } else {
                onShowNotification('请先复制内容到剪贴板');
              }
            }}
          />
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">快捷键</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>快速翻译</span>
              <span className="font-mono">⌘⇧T</span>
            </div>
            <div className="flex justify-between">
              <span>问AI问题</span>
              <span className="font-mono">⌘⇧A</span>
            </div>
            <div className="flex justify-between">
              <span>语法检查</span>
              <span className="font-mono">⌘⇧G</span>
            </div>
            <div className="flex justify-between">
              <span>邮件润色</span>
              <span className="font-mono">⌘⇧E</span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧主内容区域 */}
      <div className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {result ? (
            <ResultDisplay
              key="result"
              result={result}
              onCopy={onCopyToClipboard}
              isProcessing={isProcessing}
            />
          ) : currentAction === 'ask_ai' && clipboardText ? (
            <QuestionInputPanel
              key="question"
              referenceText={clipboardText}
              onSubmit={(question) => {
                const combinedText = `参考内容：\n${clipboardText}\n\n问题：\n${question}`;
                onProcessText('ask_ai', combinedText);
              }}
              onCancel={() => setCurrentAction(null)}
            />
          ) : (
            <WelcomePanel key="welcome" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;