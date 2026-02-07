"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CheckCircle2Icon,
  HelpCircleIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/packages/trpc/client";

interface LessonQuizProps {
  lessonId: string;
  questionIds: string[];
  onQuizComplete: () => void;
}

interface QuestionState {
  selectedAnswer?: string;
  selectedAnswers: string[];
  isAnswered: boolean;
  isCorrect?: boolean;
  attemptCount: number;
  showHint: boolean;
}

interface QuestionData {
  id: string;
  questionText: string;
  type: string;
  hint: string | null;
  options: { id: string; label: string }[];
}

const DEFAULT_STATE: QuestionState = {
  selectedAnswers: [],
  isAnswered: false,
  attemptCount: 0,
  showHint: false,
};

// ─── Option styling helper ──────────────────────────────

function getOptionClassName(
  isSelected: boolean,
  isAnswered: boolean,
  isCorrect: boolean | undefined
): string {
  const base = "rounded-md border p-3 transition-colors ";
  if (isAnswered && !isCorrect && isSelected) {
    return `${base}border-destructive bg-destructive/5`;
  }
  if (isAnswered && isCorrect && isSelected) {
    return `${base}border-primary bg-primary/5`;
  }
  if (isSelected) {
    return `${base}border-primary bg-primary/5`;
  }
  return `${base}border-border hover:bg-muted/50`;
}

// ─── Individual Question Card ───────────────────────────

function QuestionCard({
  question,
  index,
  state,
  isPending,
  onRadioChange,
  onCheckboxChange,
  onSubmit,
  onRetry,
  onToggleHint,
}: {
  question: QuestionData;
  index: number;
  state: QuestionState;
  isPending: boolean;
  onRadioChange: (questionId: string, value: string) => void;
  onCheckboxChange: (
    questionId: string,
    optionId: string,
    checked: boolean
  ) => void;
  onSubmit: (questionId: string) => void;
  onRetry: (questionId: string) => void;
  onToggleHint: (questionId: string) => void;
}) {
  const isMultiselect = question.type === "multiselect";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted font-medium text-muted-foreground text-xs">
                {index + 1}
              </span>
              <CardTitle className="text-sm">
                {isMultiselect ? "Select All That Apply" : "Multiple Choice"}
              </CardTitle>
              {state.isAnswered && state.isCorrect && (
                <CheckCircle2Icon className="size-4 text-primary" />
              )}
            </div>
            <CardDescription className="text-xs">
              {isMultiselect
                ? "Select all correct answers."
                : "Select one answer."}
              {state.attemptCount > 0 && (
                <span className="ml-2">(Attempt {state.attemptCount})</span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field orientation="vertical">
            <FieldLabel className="mb-4 font-medium text-sm">
              {question.questionText}
            </FieldLabel>
            {isMultiselect ? (
              <MultiselectOptions
                isAnswered={state.isAnswered}
                isCorrect={state.isCorrect}
                onCheckboxChange={onCheckboxChange}
                options={question.options}
                questionId={question.id}
                selectedAnswers={state.selectedAnswers}
              />
            ) : (
              <SingleSelectOptions
                isAnswered={state.isAnswered}
                isCorrect={state.isCorrect}
                onRadioChange={onRadioChange}
                options={question.options}
                questionId={question.id}
                selectedAnswer={state.selectedAnswer}
              />
            )}
          </Field>
        </FieldGroup>

        {/* Feedback */}
        {state.isAnswered && <AnswerFeedback isCorrect={state.isCorrect} />}

        {/* Hint */}
        {state.showHint && question.hint && (
          <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
            <div className="flex items-start gap-2">
              <HelpCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <p className="text-sm">{question.hint}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {state.isAnswered && !state.isCorrect && (
            <Button
              onClick={() => onRetry(question.id)}
              size="sm"
              variant="outline"
            >
              Try Again
            </Button>
          )}
          {!state.isAnswered && (
            <Button
              disabled={state.selectedAnswers.length === 0 || isPending}
              onClick={() => onSubmit(question.id)}
              size="sm"
            >
              {isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Check Answer"
              )}
            </Button>
          )}
        </div>
        {question.hint && !state.isCorrect && (
          <Button
            onClick={() => onToggleHint(question.id)}
            size="sm"
            variant="ghost"
          >
            <HelpCircleIcon className="size-4" />
            {state.showHint ? "Hide Hint" : "Show Hint"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// ─── Multiselect Options ────────────────────────────────

function MultiselectOptions({
  questionId,
  options,
  selectedAnswers,
  isAnswered,
  isCorrect,
  onCheckboxChange,
}: {
  questionId: string;
  options: { id: string; label: string }[];
  selectedAnswers: string[];
  isAnswered: boolean;
  isCorrect?: boolean;
  onCheckboxChange: (
    questionId: string,
    optionId: string,
    checked: boolean
  ) => void;
}) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = selectedAnswers.includes(option.id);
        const className = getOptionClassName(isSelected, isAnswered, isCorrect);
        const showCorrect = isAnswered && isCorrect && isSelected;
        const showIncorrect = isAnswered && !isCorrect && isSelected;

        return (
          <Field className={className} key={option.id} orientation="horizontal">
            <Checkbox
              checked={isSelected}
              disabled={isAnswered}
              id={`${questionId}-${option.id}`}
              onCheckedChange={(checked) =>
                onCheckboxChange(questionId, option.id, checked === true)
              }
            />
            <FieldLabel
              className="flex-1 cursor-pointer text-sm"
              htmlFor={`${questionId}-${option.id}`}
            >
              {option.label}
            </FieldLabel>
            {showCorrect && (
              <CheckCircle2Icon className="size-4 shrink-0 text-primary" />
            )}
            {showIncorrect && (
              <XCircleIcon className="size-4 shrink-0 text-destructive" />
            )}
          </Field>
        );
      })}
    </div>
  );
}

// ─── Single Select Options ──────────────────────────────

function SingleSelectOptions({
  questionId,
  options,
  selectedAnswer,
  isAnswered,
  isCorrect,
  onRadioChange,
}: {
  questionId: string;
  options: { id: string; label: string }[];
  selectedAnswer?: string;
  isAnswered: boolean;
  isCorrect?: boolean;
  onRadioChange: (questionId: string, value: string) => void;
}) {
  return (
    <RadioGroup
      disabled={isAnswered}
      onValueChange={(value) => onRadioChange(questionId, value)}
      value={selectedAnswer ?? ""}
    >
      {options.map((option) => {
        const isSelected = selectedAnswer === option.id;
        const className = getOptionClassName(isSelected, isAnswered, isCorrect);
        const showCorrect = isAnswered && isCorrect && isSelected;
        const showIncorrect = isAnswered && !isCorrect && isSelected;

        return (
          <Field className={className} key={option.id} orientation="horizontal">
            <RadioGroupItem
              disabled={isAnswered}
              id={`${questionId}-${option.id}`}
              value={option.id}
            />
            <FieldLabel
              className="flex-1 cursor-pointer text-sm"
              htmlFor={`${questionId}-${option.id}`}
            >
              {option.label}
            </FieldLabel>
            {showCorrect && (
              <CheckCircle2Icon className="size-4 shrink-0 text-primary" />
            )}
            {showIncorrect && (
              <XCircleIcon className="size-4 shrink-0 text-destructive" />
            )}
          </Field>
        );
      })}
    </RadioGroup>
  );
}

// ─── Answer Feedback ────────────────────────────────────

function AnswerFeedback({ isCorrect }: { isCorrect?: boolean }) {
  return (
    <div
      className={`mt-4 rounded-md border p-3 ${
        isCorrect
          ? "border-primary bg-primary/5"
          : "border-destructive bg-destructive/5"
      }`}
    >
      <div className="flex items-center gap-2">
        {isCorrect ? (
          <>
            <CheckCircle2Icon className="size-4 text-primary" />
            <span className="font-medium text-primary text-sm">Correct!</span>
          </>
        ) : (
          <>
            <XCircleIcon className="size-4 text-destructive" />
            <span className="font-medium text-destructive text-sm">
              Incorrect. Try again.
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Quiz Component ────────────────────────────────

export function LessonQuiz({
  lessonId,
  questionIds,
  onQuizComplete,
}: LessonQuizProps) {
  const [questionStates, setQuestionStates] = useState<
    Record<string, QuestionState>
  >({});

  const { data: questions, isLoading: questionsLoading } = useQuery({
    ...trpc.lesson.getQuizQuestions.queryOptions({ lessonId }),
  });

  // Restore existing quiz state
  useQuery({
    ...trpc.lesson.getQuizState.queryOptions({ lessonId }),
    select: (data) => {
      if (data && Object.keys(questionStates).length === 0) {
        const newStates: Record<string, QuestionState> = {};
        for (const attempt of data.latestAttempts) {
          const count =
            data.attemptCounts.find((a) => a.questionId === attempt.questionId)
              ?.attempts ?? 0;
          newStates[attempt.questionId] = {
            selectedAnswers: attempt.selectedAnswers as string[],
            selectedAnswer: (attempt.selectedAnswers as string[])[0],
            isAnswered: true,
            isCorrect: attempt.isCorrect,
            attemptCount: count,
            showHint: false,
          };
        }
        if (Object.keys(newStates).length > 0) {
          setQuestionStates(newStates);
        }
        if (data.isQuizComplete) {
          onQuizComplete();
        }
      }
      return data;
    },
  });

  const submitMutation = useMutation({
    ...trpc.lesson.submitQuizAnswer.mutationOptions(),
    onSuccess: (result, variables) => {
      setQuestionStates((prev) => ({
        ...prev,
        [variables.questionId]: {
          ...(prev[variables.questionId] ?? DEFAULT_STATE),
          isAnswered: true,
          isCorrect: result.isCorrect,
          attemptCount: result.attemptNumber,
        },
      }));

      // Check if all questions are now correctly answered
      const currentCorrect = new Set(
        Object.entries(questionStates)
          .filter(([, s]) => s.isCorrect)
          .map(([id]) => id)
      );
      if (result.isCorrect) {
        currentCorrect.add(variables.questionId);
      }
      if (questionIds.every((id) => currentCorrect.has(id))) {
        onQuizComplete();
      }
    },
  });

  const handleRadioChange = useCallback((questionId: string, value: string) => {
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? DEFAULT_STATE),
        selectedAnswer: value,
        selectedAnswers: [value],
      },
    }));
  }, []);

  const handleCheckboxChange = useCallback(
    (questionId: string, optionId: string, checked: boolean) => {
      setQuestionStates((prev) => {
        const current = prev[questionId] ?? DEFAULT_STATE;
        const newSelected = checked
          ? [...current.selectedAnswers, optionId]
          : current.selectedAnswers.filter((id) => id !== optionId);
        return {
          ...prev,
          [questionId]: { ...current, selectedAnswers: newSelected },
        };
      });
    },
    []
  );

  const handleSubmit = useCallback(
    (questionId: string) => {
      const state = questionStates[questionId];
      if (!state) {
        return;
      }
      submitMutation.mutate({
        lessonId,
        questionId,
        selectedAnswers: state.selectedAnswers,
      });
    },
    [questionStates, lessonId, submitMutation]
  );

  const handleRetry = useCallback((questionId: string) => {
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? DEFAULT_STATE),
        selectedAnswer: undefined,
        selectedAnswers: [],
        isAnswered: false,
        isCorrect: undefined,
      },
    }));
  }, []);

  const handleToggleHint = useCallback((questionId: string) => {
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? DEFAULT_STATE),
        showHint: !(prev[questionId]?.showHint ?? false),
      },
    }));
  }, []);

  if (questionsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Separator />
      <div>
        <h2 className="font-semibold text-lg">Questions</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Answer all questions correctly to complete this lesson.
        </p>
      </div>

      {questions.map((question, index) => (
        <QuestionCard
          index={index}
          isPending={submitMutation.isPending}
          key={question.id}
          onCheckboxChange={handleCheckboxChange}
          onRadioChange={handleRadioChange}
          onRetry={handleRetry}
          onSubmit={handleSubmit}
          onToggleHint={handleToggleHint}
          question={question}
          state={questionStates[question.id] ?? DEFAULT_STATE}
        />
      ))}
    </div>
  );
}
