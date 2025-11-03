import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../../lib/db';
import { createEntitySchema } from '../../../lib/validations';

const updateSchema = createEntitySchema.partial();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.parse(body);

    const updated = await db.$transaction(async (tx) => {
      const ent = await tx.entity.update({
        where: { id },
        data: {
          name: parsed.name,
          description: parsed.description,
          positionX: parsed.position?.x ?? null,
          positionY: parsed.position?.y ?? null,
        },
        include: { attributes: true },
      });

      if (parsed.attributeIds) {
        await tx.entityAttribute.deleteMany({ where: { entityId: id } });
        if (parsed.attributeIds.length > 0) {
          await tx.entityAttribute.createMany({
            data: parsed.attributeIds.map((attributeId) => ({ entityId: id, attributeId })),
          });
        }
      }

      const full = await tx.entity.findUnique({
        where: { id: ent.id },
        include: { attributes: true },
      });

      return {
        id: full!.id,
        name: full!.name,
        description: full!.description ?? undefined,
        attributeIds: full!.attributes.map((ea: any) => ea.attributeId),
        position: full!.positionX != null && full!.positionY != null ? { x: full!.positionX, y: full!.positionY } : undefined,
      };
    });

    return NextResponse.json({ data: updated, success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update entity', success: false }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.entity.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete entity', success: false }, { status: 500 });
  }
}
