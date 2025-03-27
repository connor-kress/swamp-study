import { describe, it, expect } from 'vitest';
import { idParamsSchema } from '../src/routes/user';

describe("ID Parameter Parsing", () => {
  it("should fail validation when id is missing", () => {
    // When id is missing, safeParse should fail.
    const data: any = {};
    const result = idParamsSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty("id");
    }
  });

  it("should correctly transform a valid id string to a number", () => {
    const data = { id: "456" };
    const result = idParamsSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(456);
    }
  });
});
