import { z } from "zod";

export const categoryIdSchema = z.object({
  id: z.coerce.number().int().positive("Invalid category ID"),
});
