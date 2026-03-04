import { z } from 'zod';

export const createCycleSchema = z.object({
    breedSource: z.string().optional(),
    season: z.string().optional(),
    cycleName: z.string().optional(),
    stockingDate: z.string().optional(),
    stockingQuantity: z.string().optional(),
    age: z.string().optional(),
    notes: z.string().optional(),

    // Extra fields that help rendering UI but not sent to the server directly
    density: z.number().optional(),
    breedName: z.string().optional(),
});

export type CreateCycleFormValues = z.infer<typeof createCycleSchema>;
