import { z } from "zod";

export const WelcomeEmailPayload = z.object({
  userId: z.string(),
  email: z.email(),
  name: z.string(),
});

export type WelcomeEmailPayload = z.infer<typeof WelcomeEmailPayload>;
