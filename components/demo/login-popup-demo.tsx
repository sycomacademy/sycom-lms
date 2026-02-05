"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginPopupDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-center">
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger render={<Button>Open Login</Button>} />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
            <DialogDescription>
              Enter your credentials to access your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <FieldGroup>
                <Input placeholder="you@example.com" type="email" />
              </FieldGroup>
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <FieldGroup>
                <Input placeholder="••••••••" type="password" />
              </FieldGroup>
            </Field>
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button className="hover:text-foreground" type="button">
                Forgot password?
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Sign In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
