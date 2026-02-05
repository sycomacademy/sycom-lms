"use client";

import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { useState } from "react";
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

interface AnswerOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

interface MultipleChoiceQuestion {
  id: string;
  question: string;
  options: AnswerOption[];
  selectedAnswer?: string;
  isAnswered: boolean;
  isCorrect?: boolean;
}

interface MultiselectQuestion {
  id: string;
  question: string;
  options: AnswerOption[];
  selectedAnswers: string[];
  isAnswered: boolean;
  isCorrect?: boolean;
}

export function QuizDemo() {
  const [multipleChoiceQuestion, setMultipleChoiceQuestion] =
    useState<MultipleChoiceQuestion>({
      id: "mcq-1",
      question: "Which of the following is a primary goal of cybersecurity?",
      options: [
        {
          id: "option-1",
          label: "To increase network speed",
          isCorrect: false,
        },
        {
          id: "option-2",
          label: "To protect information and systems from threats",
          isCorrect: true,
        },
        {
          id: "option-3",
          label: "To reduce hardware costs",
          isCorrect: false,
        },
        {
          id: "option-4",
          label: "To improve user interface design",
          isCorrect: false,
        },
      ],
      isAnswered: false,
    });

  const [multiselectQuestion, setMultiselectQuestion] =
    useState<MultiselectQuestion>({
      id: "msq-1",
      question:
        "Which of the following are common types of cyber attacks? (Select all that apply)",
      options: [
        {
          id: "ms-option-1",
          label: "Phishing",
          isCorrect: true,
        },
        {
          id: "ms-option-2",
          label: "Malware",
          isCorrect: true,
        },
        {
          id: "ms-option-3",
          label: "Social engineering",
          isCorrect: true,
        },
        {
          id: "ms-option-4",
          label: "Email formatting",
          isCorrect: false,
        },
        {
          id: "ms-option-5",
          label: "DDoS attacks",
          isCorrect: true,
        },
      ],
      selectedAnswers: [],
      isAnswered: false,
    });

  const handleMultipleChoiceChange = (value: string) => {
    setMultipleChoiceQuestion((prev) => ({
      ...prev,
      selectedAnswer: value,
    }));
  };

  const handleMultiselectChange = (optionId: string, checked: boolean) => {
    setMultiselectQuestion((prev) => {
      const newSelected = checked
        ? [...prev.selectedAnswers, optionId]
        : prev.selectedAnswers.filter((id) => id !== optionId);
      return {
        ...prev,
        selectedAnswers: newSelected,
      };
    });
  };

  const checkMultipleChoiceAnswer = () => {
    const selectedOption = multipleChoiceQuestion.options.find(
      (opt) => opt.id === multipleChoiceQuestion.selectedAnswer
    );
    const isCorrect = selectedOption?.isCorrect ?? false;

    setMultipleChoiceQuestion((prev) => ({
      ...prev,
      isAnswered: true,
      isCorrect,
    }));
  };

  const checkMultiselectAnswer = () => {
    const correctAnswers = multiselectQuestion.options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt.id)
      .sort();
    const selectedAnswers = [...multiselectQuestion.selectedAnswers].sort();

    const isCorrect =
      correctAnswers.length === selectedAnswers.length &&
      correctAnswers.every((id, index) => id === selectedAnswers[index]);

    setMultiselectQuestion((prev) => ({
      ...prev,
      isAnswered: true,
      isCorrect,
    }));
  };

  const resetMultipleChoice = () => {
    setMultipleChoiceQuestion({
      id: "mcq-1",
      question: "Which of the following is a primary goal of cybersecurity?",
      options: [
        {
          id: "option-1",
          label: "To increase network speed",
          isCorrect: false,
        },
        {
          id: "option-2",
          label: "To protect information and systems from threats",
          isCorrect: true,
        },
        {
          id: "option-3",
          label: "To reduce hardware costs",
          isCorrect: false,
        },
        {
          id: "option-4",
          label: "To improve user interface design",
          isCorrect: false,
        },
      ],
      isAnswered: false,
    });
  };

  const resetMultiselect = () => {
    setMultiselectQuestion({
      id: "msq-1",
      question:
        "Which of the following are common types of cyber attacks? (Select all that apply)",
      options: [
        {
          id: "ms-option-1",
          label: "Phishing",
          isCorrect: true,
        },
        {
          id: "ms-option-2",
          label: "Malware",
          isCorrect: true,
        },
        {
          id: "ms-option-3",
          label: "Social engineering",
          isCorrect: true,
        },
        {
          id: "ms-option-4",
          label: "Email formatting",
          isCorrect: false,
        },
        {
          id: "ms-option-5",
          label: "DDoS attacks",
          isCorrect: true,
        },
      ],
      selectedAnswers: [],
      isAnswered: false,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Multiple Choice Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted font-medium text-muted-foreground text-xs">
                  1
                </span>
                <CardTitle>Multiple Choice Question</CardTitle>
              </div>
              <CardDescription>
                Select a single answer from the options below.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="vertical">
              <FieldLabel className="mb-4 font-medium text-base">
                {multipleChoiceQuestion.question}
              </FieldLabel>
              <RadioGroup
                disabled={multipleChoiceQuestion.isAnswered}
                onValueChange={handleMultipleChoiceChange}
                value={multipleChoiceQuestion.selectedAnswer}
              >
                {multipleChoiceQuestion.options.map((option) => {
                  const isSelected =
                    multipleChoiceQuestion.selectedAnswer === option.id;
                  const showFeedback =
                    multipleChoiceQuestion.isAnswered && isSelected;
                  const isCorrect = option.isCorrect;

                  let className = "rounded-md border p-3 transition-colors ";
                  if (showFeedback) {
                    className += isCorrect
                      ? "border-primary bg-primary/5"
                      : "border-destructive bg-destructive/5";
                  } else if (isSelected) {
                    className += "border-primary bg-primary/5";
                  } else {
                    className += "border-border hover:bg-muted/50";
                  }

                  return (
                    <Field
                      className={className}
                      key={option.id}
                      orientation="horizontal"
                    >
                      <RadioGroupItem
                        disabled={multipleChoiceQuestion.isAnswered}
                        id={option.id}
                        value={option.id}
                      />
                      <FieldLabel
                        className="flex-1 cursor-pointer"
                        htmlFor={option.id}
                      >
                        {option.label}
                      </FieldLabel>
                      {showFeedback && (
                        <div className="flex shrink-0 items-center">
                          {isCorrect ? (
                            <CheckCircle2Icon className="size-5 text-primary" />
                          ) : (
                            <XCircleIcon className="size-5 text-destructive" />
                          )}
                        </div>
                      )}
                    </Field>
                  );
                })}
              </RadioGroup>
            </Field>
          </FieldGroup>
          {multipleChoiceQuestion.isAnswered && (
            <div
              className={`mt-4 rounded-md border p-3 ${
                multipleChoiceQuestion.isCorrect
                  ? "border-primary bg-primary/5"
                  : "border-destructive bg-destructive/5"
              }`}
            >
              <div className="flex items-center gap-2">
                {multipleChoiceQuestion.isCorrect ? (
                  <>
                    <CheckCircle2Icon className="size-5 text-primary" />
                    <span className="font-medium text-primary text-sm">
                      Correct! Well done.
                    </span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="size-5 text-destructive" />
                    <span className="font-medium text-destructive text-sm">
                      Incorrect. The correct answer is: "To protect information
                      and systems from threats"
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-4">
          {multipleChoiceQuestion.isAnswered ? (
            <Button onClick={resetMultipleChoice} variant="outline">
              Try Again
            </Button>
          ) : (
            <Button
              disabled={!multipleChoiceQuestion.selectedAnswer}
              onClick={checkMultipleChoiceAnswer}
            >
              Check Answer
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Multiselect Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted font-medium text-muted-foreground text-xs">
                  2
                </span>
                <CardTitle>Multiselect Question</CardTitle>
              </div>
              <CardDescription>
                Select all correct answers from the options below.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="vertical">
              <FieldLabel className="mb-4 font-medium text-base">
                {multiselectQuestion.question}
              </FieldLabel>
              <div className="space-y-3">
                {multiselectQuestion.options.map((option) => {
                  const isSelected =
                    multiselectQuestion.selectedAnswers.includes(option.id);
                  const showFeedback =
                    multiselectQuestion.isAnswered && option.isCorrect;
                  const showIncorrect =
                    multiselectQuestion.isAnswered &&
                    isSelected &&
                    !option.isCorrect;

                  let className = "rounded-md border p-3 transition-colors ";
                  if (showIncorrect) {
                    className += "border-destructive bg-destructive/5";
                  } else if (showFeedback) {
                    className += "border-primary bg-primary/5";
                  } else if (isSelected) {
                    className += "border-primary bg-primary/5";
                  } else {
                    className += "border-border hover:bg-muted/50";
                  }

                  return (
                    <Field
                      className={className}
                      key={option.id}
                      orientation="horizontal"
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={multiselectQuestion.isAnswered}
                        id={option.id}
                        onCheckedChange={(checked) =>
                          handleMultiselectChange(option.id, checked === true)
                        }
                      />
                      <FieldLabel
                        className="flex-1 cursor-pointer"
                        htmlFor={option.id}
                      >
                        {option.label}
                      </FieldLabel>
                      {showFeedback && (
                        <div className="flex shrink-0 items-center">
                          <CheckCircle2Icon className="size-5 text-primary" />
                        </div>
                      )}
                      {showIncorrect && (
                        <div className="flex shrink-0 items-center">
                          <XCircleIcon className="size-5 text-destructive" />
                        </div>
                      )}
                    </Field>
                  );
                })}
              </div>
            </Field>
          </FieldGroup>
          {multiselectQuestion.isAnswered && (
            <div
              className={`mt-4 rounded-md border p-3 ${
                multiselectQuestion.isCorrect
                  ? "border-primary bg-primary/5"
                  : "border-destructive bg-destructive/5"
              }`}
            >
              <div className="flex items-center gap-2">
                {multiselectQuestion.isCorrect ? (
                  <>
                    <CheckCircle2Icon className="size-5 text-primary" />
                    <span className="font-medium text-primary text-sm">
                      Correct! All correct answers selected.
                    </span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="size-5 text-destructive" />
                    <span className="font-medium text-destructive text-sm">
                      Not quite. Make sure you've selected all correct answers:
                      Phishing, Malware, Social engineering, and DDoS attacks.
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-4">
          {multiselectQuestion.isAnswered ? (
            <Button onClick={resetMultiselect} variant="outline">
              Try Again
            </Button>
          ) : (
            <Button
              disabled={multiselectQuestion.selectedAnswers.length === 0}
              onClick={checkMultiselectAnswer}
            >
              Check Answer
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
