import { z } from "zod";

export const moduleInstanceSchema = z.object({
  uid: z.string(),
  moduleId: z.string(),
  props: z.record(z.string(), z.unknown()),
});

export const themeSchema = z
  .object({
    darkMode: z.boolean().optional(),
    darkAccent: z.string().optional(),
  })
  .optional();

export const templateSchema = z.object({
  version: z.literal(1),
  name: z.string().optional(),
  theme: themeSchema,
  instances: z.array(moduleInstanceSchema),
});

export type TemplateFile = z.infer<typeof templateSchema>;
