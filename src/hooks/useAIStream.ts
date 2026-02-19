/**
 * Hook for streaming AI responses from InsForge AI Gateway.
 * Handles SSE parsing, progressive content rendering, and error states.
 *
 * @hook useAIStream
 */
'use client';

import { useState, useCallback, useRef } from 'react';

interface UseAIStreamReturn {
  /** Current streamed content */
  content: string;
  /** Whether the AI is currently generating */
  isStreaming: boolean;
  /** Error message if streaming failed */
  error: string | null;
  /** Elapsed time in seconds since streaming started */
  elapsedTime: number;
  /** Start streaming with a URL and fetch options */
  startStream: (url: string, options?: RequestInit) => Promise<void>;
  /** Abort the current stream */
  abort: () => void;
  /** Reset the stream state */
  reset: () => void;
}

export function useAIStream(): UseAIStreamReturn {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startStream = useCallback(
    async (url: string, options?: RequestInit) => {
      setContent('');
      setError(null);
      setIsStreaming(true);
      setElapsedTime(0);

      const controller = new AbortController();
      abortControllerRef.current = controller;
      startTimer();

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const stream = response.body;
        if (!stream) {
          throw new Error('Failed to start AI stream');
        }

        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          if (controller.signal.aborted) break;

          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data) as {
                  choices: Array<{ delta: { content?: string } }>;
                };
                const delta = parsed.choices[0]?.delta?.content;
                if (delta) {
                  fullContent += delta;
                  setContent(fullContent);
                }
              } catch {
                /* Skip malformed chunks */
              }
            }
          }
        }

        stopTimer();
        setIsStreaming(false);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          stopTimer();
          setIsStreaming(false);
          return;
        }
        stopTimer();
        setIsStreaming(false);
        const errorMessage =
          err instanceof Error ? err.message : 'We couldn\'t generate your plan. Please try again.';
        setError(errorMessage);
      }
    },
    [startTimer, stopTimer]
  );

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    stopTimer();
    setIsStreaming(false);
  }, [stopTimer]);

  const reset = useCallback(() => {
    setContent('');
    setError(null);
    setIsStreaming(false);
    setElapsedTime(0);
    abortControllerRef.current?.abort();
    stopTimer();
  }, [stopTimer]);

  return {
    content,
    isStreaming,
    error,
    elapsedTime,
    startStream,
    abort,
    reset,
  };
}
