"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface QuizCompletionContextValue {
  onBlockCorrect: (blockId: number, correct: boolean) => void;
  requiredCount: number;
}

const QuizCompletionContext = createContext<
  QuizCompletionContextValue | undefined
>(undefined);

export function useQuizCompletion() {
  return useContext(QuizCompletionContext);
}

export function QuizCompletionProvider({
  children,
  requiredCount,
  onAllCorrectChange,
}: {
  children: React.ReactNode;
  requiredCount: number;
  onAllCorrectChange: (allCorrect: boolean) => void;
}) {
  const [_correctedBlocks, setCorrectedBlocks] = useState<Set<number>>(
    () => new Set()
  );

  useEffect(() => {
    if (requiredCount === 0) {
      onAllCorrectChange(true);
    }
  }, [requiredCount, onAllCorrectChange]);

  const onBlockCorrect = useCallback(
    (blockId: number, correct: boolean) => {
      setCorrectedBlocks((prev) => {
        const next = new Set(prev);
        if (correct) {
          next.add(blockId);
        } else {
          next.delete(blockId);
        }
        const allCorrect = requiredCount === 0 || next.size >= requiredCount;
        onAllCorrectChange(allCorrect);
        return next;
      });
    },
    [requiredCount, onAllCorrectChange]
  );

  const value = useMemo(
    () => ({ onBlockCorrect, requiredCount }),
    [onBlockCorrect, requiredCount]
  );

  return (
    <QuizCompletionContext.Provider value={value}>
      {children}
    </QuizCompletionContext.Provider>
  );
}
