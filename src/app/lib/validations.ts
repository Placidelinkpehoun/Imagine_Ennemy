import { z } from 'zod';

const createAttributeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional()
});

const createGameClassSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  parentId: z.string().cuid().optional(),
  attributeIds: z.array(z.string().cuid()).optional()
});

const createEntitySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }).optional(),
  attributeIds: z.array(z.string().cuid()).optional()
});

const createConnectionSchema = z.object({
  sourceId: z.string().cuid(),
  targetId: z.string().cuid(),
  type: z.enum(['attribute-entity'])
});

export { createAttributeSchema, createGameClassSchema, createEntitySchema, createConnectionSchema };