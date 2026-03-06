"use client";

import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import {
  CheckCircle2Icon,
  CircleIcon,
  PlusIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useQuizCompletion } from "@/components/learn/quiz-completion-context";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/packages/utils/cn";

function normalizeCorrectIndexes(
  options: string[],
  correctIndexes: number[] | undefined,
  correctIndex: number | undefined
) {
  const unique = Array.from(
    new Set((correctIndexes ?? []).filter((index) => Number.isInteger(index)))
  ).filter((index) => index >= 0 && index < options.length);

  if (unique.length > 0) {
    return unique;
  }

  if (!options.length) {
    return [];
  }

  const fallbackIndex =
    typeof correctIndex === "number" &&
    Number.isInteger(correctIndex) &&
    correctIndex >= 0 &&
    correctIndex < options.length
      ? correctIndex
      : 0;

  return [fallbackIndex];
}

export function QuizBlockView({
  node,
  updateAttributes,
  selected,
  editor,
  getPos,
}: NodeViewProps) {
  const quizCompletion = useQuizCompletion();
  const { question, options, correctIndex } = node.attrs as {
    question: string;
    options: string[];
    correctIndex: number;
    correctIndexes?: number[];
    allowMultiple?: boolean;
  };
  const allowMultiple = Boolean(
    (node.attrs as { allowMultiple?: boolean }).allowMultiple
  );
  const normalizedCorrectIndexes = normalizeCorrectIndexes(
    options,
    (node.attrs as { correctIndexes?: number[] }).correctIndexes,
    correctIndex
  );

  const isEditable = editor.isEditable;
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleQuestionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateAttributes({ question: e.target.value });
    },
    [updateAttributes]
  );

  const handleOptionChange = useCallback(
    (index: number, value: string) => {
      const newOptions = [...options];
      newOptions[index] = value;
      updateAttributes({ options: newOptions });
    },
    [options, updateAttributes]
  );

  const handleSetCorrect = useCallback(
    (index: number) => {
      if (allowMultiple) {
        const isAlreadyCorrect = normalizedCorrectIndexes.includes(index);
        const nextCorrectIndexes = isAlreadyCorrect
          ? normalizedCorrectIndexes.filter((item) => item !== index)
          : [...normalizedCorrectIndexes, index];
        const safeCorrectIndexes =
          nextCorrectIndexes.length > 0 ? nextCorrectIndexes : [index];

        updateAttributes({
          correctIndex: safeCorrectIndexes[0],
          correctIndexes: safeCorrectIndexes,
        });
        return;
      }

      updateAttributes({ correctIndex: index, correctIndexes: [index] });
    },
    [allowMultiple, normalizedCorrectIndexes, updateAttributes]
  );

  const handleToggleMode = useCallback(() => {
    if (allowMultiple) {
      const firstCorrectIndex =
        normalizedCorrectIndexes.length > 0
          ? Math.min(...normalizedCorrectIndexes)
          : 0;
      updateAttributes({
        allowMultiple: false,
        correctIndex: firstCorrectIndex,
        correctIndexes: [firstCorrectIndex],
      });
      return;
    }

    updateAttributes({
      allowMultiple: true,
      correctIndex: normalizedCorrectIndexes[0] ?? 0,
      correctIndexes: normalizedCorrectIndexes,
    });
  }, [allowMultiple, normalizedCorrectIndexes, updateAttributes]);

  const handleSelectAnswer = useCallback(
    (index: number) => {
      setSelectedAnswers((current) => {
        if (!allowMultiple) {
          return [index];
        }

        return current.includes(index)
          ? current.filter((item) => item !== index)
          : [...current, index];
      });
    },
    [allowMultiple]
  );

  const handleModeChange = useCallback(
    (value: string) => {
      const shouldAllowMultiple = value === "multiple";
      if (shouldAllowMultiple === allowMultiple) {
        return;
      }

      handleToggleMode();
    },
    [allowMultiple, handleToggleMode]
  );

  const handleAddOption = useCallback(() => {
    updateAttributes({
      options: [
        ...options,
        `Option ${String.fromCharCode(65 + options.length)}`,
      ],
    });
  }, [options, updateAttributes]);

  const handleRemoveOption = useCallback(
    (index: number) => {
      if (options.length <= 2) {
        return;
      }

      const newOptions = options.filter((_: string, i: number) => i !== index);
      const remappedCorrectIndexes = normalizedCorrectIndexes
        .filter((item) => item !== index)
        .map((item) => (item > index ? item - 1 : item));

      const safeCorrectIndexes =
        remappedCorrectIndexes.length > 0 && newOptions.length > 0
          ? remappedCorrectIndexes
          : [0];

      updateAttributes({
        options: newOptions,
        correctIndex: safeCorrectIndexes[0],
        correctIndexes: safeCorrectIndexes,
      });
    },
    [normalizedCorrectIndexes, options, updateAttributes]
  );

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswers.length > 0) {
      setSubmitted(true);
      if (quizCompletion && typeof getPos === "function") {
        const correctSet = new Set(normalizedCorrectIndexes);
        const selectedSet = new Set(selectedAnswers);
        const isCorrect =
          correctSet.size === selectedSet.size &&
          [...correctSet].every((i) => selectedSet.has(i));
        if (isCorrect) {
          const pos = getPos();
          if (typeof pos === "number") {
            quizCompletion.onBlockCorrect(pos, true);
          }
        }
      }
    }
  }, [selectedAnswers, normalizedCorrectIndexes, quizCompletion, getPos]);

  const handleReset = useCallback(() => {
    if (quizCompletion && typeof getPos === "function") {
      const pos = getPos();
      if (typeof pos === "number") {
        quizCompletion.onBlockCorrect(pos, false);
      }
    }
    setSelectedAnswers([]);
    setSubmitted(false);
  }, [quizCompletion, getPos]);

  if (isEditable) {
    return (
      <NodeViewWrapper
        className={cn(
          "my-3 rounded-md border-2 border-info/30 bg-info/5",
          selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
        data-type="quiz-block"
      >
        <div className="border-info/20 border-b bg-info/10 px-4 py-2">
          <span className="font-semibold text-info text-xs">Quiz Block</span>
        </div>

        <div className="space-y-3 p-4">
          <textarea
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/50"
            onChange={handleQuestionChange}
            placeholder="Enter your question..."
            rows={2}
            value={question}
          />

          <RadioGroup
            className="flex flex-row gap-4"
            onValueChange={handleModeChange}
            value={allowMultiple ? "multiple" : "single"}
          >
            <div className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="single" />
              Single
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="multiple" />
              Multiple
            </div>
          </RadioGroup>

          <div className="space-y-2">
            {options.map((option: string, index: number) => (
              <div className="flex items-center gap-2" key={index}>
                <button
                  className={cn(
                    "shrink-0 transition-colors",
                    normalizedCorrectIndexes.includes(index)
                      ? "text-success"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleSetCorrect(index)}
                  title={
                    normalizedCorrectIndexes.includes(index)
                      ? "Correct answer"
                      : "Mark as correct"
                  }
                  type="button"
                >
                  {normalizedCorrectIndexes.includes(index) ? (
                    <CheckCircle2Icon className="size-5" />
                  ) : (
                    <CircleIcon className="size-5" />
                  )}
                </button>

                <input
                  className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/50"
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  type="text"
                  value={option}
                />

                {options.length > 2 && (
                  <button
                    className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                    onClick={() => handleRemoveOption(index)}
                    type="button"
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 8 && (
            <Button
              className="gap-1.5 text-muted-foreground"
              onClick={handleAddOption}
              size="sm"
              variant="ghost"
            >
              <PlusIcon className="size-3.5" />
              Add Option
            </Button>
          )}
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      className="my-3 rounded-md border-2 border-info/30 bg-info/5"
      data-type="quiz-block"
    >
      <div className="border-info/20 border-b bg-info/10 px-4 py-2">
        <span className="font-semibold text-info text-xs">Quiz</span>
      </div>

      <div className="space-y-3 p-4">
        <p className="font-medium text-foreground">{question}</p>

        <div className="space-y-2">
          {options.map((option: string, index: number) => {
            const isCorrect = normalizedCorrectIndexes.includes(index);
            const isSelected = selectedAnswers.includes(index);
            const showResult = submitted;

            return (
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border px-4 py-2.5 text-left text-sm transition-all",
                  !showResult && isSelected && "border-primary bg-primary/10",
                  !(showResult || isSelected) &&
                    "border-border hover:border-primary/50 hover:bg-muted/50",
                  showResult &&
                    isCorrect &&
                    "border-success bg-success/10 text-success",
                  showResult &&
                    isSelected &&
                    !isCorrect &&
                    "border-destructive bg-destructive/10 text-destructive",
                  showResult &&
                    !isCorrect &&
                    !isSelected &&
                    "border-border opacity-50"
                )}
                disabled={submitted}
                key={index}
                onClick={() => handleSelectAnswer(index)}
                type="button"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border font-medium text-xs">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {showResult && isCorrect && (
                  <CheckCircle2Icon className="size-5 shrink-0 text-success" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircleIcon className="size-5 shrink-0 text-destructive" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          {submitted ? (
            <Button onClick={handleReset} size="sm" variant="outline">
              Try Again
            </Button>
          ) : (
            <Button
              disabled={selectedAnswers.length === 0}
              onClick={handleSubmitAnswer}
              size="sm"
            >
              {allowMultiple ? "Check Answers" : "Check Answer"}
            </Button>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
