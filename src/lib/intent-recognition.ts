
import { Intent } from '@/types/chat';

export function recognizeIntent(message: string): Intent {
  const lowerCaseMessage = message.toLowerCase();

  if (lowerCaseMessage.includes('教案')) {
    return 'lesson-plan';
  }
  if (lowerCaseMessage.includes('图片') || lowerCaseMessage.includes('插图')) {
    return 'image-generation';
  }
  if (lowerCaseMessage.includes('ppt') || lowerCaseMessage.includes('幻灯片')) {
    return 'ppt-creation';
  }
  if (['你好', '您好', 'hi', 'hello'].some(greet => lowerCaseMessage.includes(greet))) {
      return 'greeting';
  }
  
  return 'unknown';
}
