const createAttributeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional()
});

const createGameClassSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  parentId: z.string().uuid().optional(),
  attributeIds: z.array(z.string().uuid()).optional()
});

const createEntitySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }).optional(),
  attributeIds: z.array(z.string().uuid()).optional()
});

const createConnectionSchema = z.object({
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  type: z.enum(['attribute-entity'])
});

// Success Response (200, 201)
{
  "data": { ... },
  "success": true
}

// Error Response (400, 404, 500)
{
  "error": "Validation failed",
  "details": [
    { "field": "name", "message": "Name is required" }
  ],
  "success": false
}