import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

type RequestTarget = "body" | "params" | "query";

export function validate(schema: ZodType, target: RequestTarget = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      // Flatten all Zod issues into a single readable string
      const message = result.error.issues
        .map((e: { message: string }) => e.message)
        .join("; ");
      res.status(400).json({ message });
      return;
    }

    // Replace with the parsed + coerced + defaulted data
    (req as unknown as Record<string, unknown>)[target] = result.data;
    next();
  };
}
