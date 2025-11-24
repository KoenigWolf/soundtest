/**
 * オーディオ処理に関するエラーメッセージ定義
 */

export const ERROR_MESSAGES = {
  DEVICE_ENUMERATION_FAILED: 'Failed to enumerate audio devices. Please check your browser permissions.',
  MICROPHONE_ACCESS_DENIED: 'Microphone access denied. Please grant permission to use the microphone.',
  MICROPHONE_NOT_FOUND: 'No microphone found. Please connect a microphone device.',
  RECORDING_FAILED: 'Failed to start recording. Please ensure your microphone is working correctly.',
  AUDIO_CONTEXT_FAILED: 'Failed to initialize audio context. Your browser may not support this feature.',
} as const;

export type ErrorType = keyof typeof ERROR_MESSAGES;

/**
 * エラーから適切なメッセージを取得
 */
export function getErrorMessage(error: unknown, defaultType: ErrorType = 'RECORDING_FAILED'): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('permission') || message.includes('denied')) {
      return ERROR_MESSAGES.MICROPHONE_ACCESS_DENIED;
    }
    if (message.includes('not found') || message.includes('device')) {
      return ERROR_MESSAGES.MICROPHONE_NOT_FOUND;
    }
    if (message.includes('context')) {
      return ERROR_MESSAGES.AUDIO_CONTEXT_FAILED;
    }
    
    return error.message;
  }
  
  return ERROR_MESSAGES[defaultType];
}

