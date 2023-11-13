import { z } from 'zod';

const TargetValidator = z.enum(['address', 'tag']);

export const IBCTransferParamValidator = z
  .object({
    target: TargetValidator,
    tags: z.array(z.string().min(1).max(255)),
    addresses: z.array(z.string().min(1).max(255)),
    direction: z.enum(['sent', 'received']),
    denom: z.string().min(1).max(255),
    comparator: z.string().min(0).max(2),
    thresholdValue: z.number().or(z.literal('')),
  })
  .refine((value) => value.tags.length > 0 || value.addresses.length > 0, {
    message: 'Either tags or addresses must have values',
  });

export type IBCTransferParam = z.infer<typeof IBCTransferParamValidator>;
