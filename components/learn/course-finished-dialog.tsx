"use client";

import { Confetti } from "@/components/elements/confetti";
import { Link } from "@/components/layout/foresight-link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CourseFinishedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
}

export function CourseFinishedDialog({
  open,
  onOpenChange,
  courseTitle,
}: CourseFinishedDialogProps) {
  return (
    <>
      {open && (
        <Confetti
          className="pointer-events-none fixed inset-0 z-[100] size-full"
          options={{
            particleCount: 150,
            spread: 80,
            origin: { y: 0.5 },
          }}
        />
      )}
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent showCloseButton={false}>
          <DialogHeader className="items-center text-center">
            <DialogTitle>Congratulations!</DialogTitle>
            <DialogDescription>
              You have completed{" "}
              <span className="font-medium text-foreground">{courseTitle}</span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center" variant="bare">
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/journey" />}
            >
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
