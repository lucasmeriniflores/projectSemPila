import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAnimatedModalOptions {
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export function useAnimatedModal({
  isOpen,
  onClose,
  duration = 200,
}: UseAnimatedModalOptions) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isClosingRef = useRef(false);
  const isRenderedRef = useRef(isOpen);
  const onCloseRef = useRef(onClose);

  onCloseRef.current = onClose;
  isClosingRef.current = isClosing;
  isRenderedRef.current = isRendered;

  useEffect(() => {
    if (isOpen) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRenderedRef.current && !isClosingRef.current) {
      // Parent set isOpen to false from outside
      setIsClosing(true);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
        closeTimerRef.current = null;
      }, duration);
    }
  }, [isOpen, duration]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleClose = useCallback(
    (onComplete?: () => void) => {
      if (isClosingRef.current) return;
      setIsClosing(true);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
        closeTimerRef.current = null;
        onComplete?.();
        onCloseRef.current();
      }, duration);
    },
    [duration]
  );

  return {
    isRendered,
    isClosing,
    handleClose,
  };
}
