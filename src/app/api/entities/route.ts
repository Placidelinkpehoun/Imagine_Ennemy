import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../lib/db';
import { createEntitySchema } from '../../lib/validations';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const entities = await db.entity.findMany({
      include: { attributes: { include: { attribute: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const data = entities.map((e: any) => ({
      id: e.id,
      name: e.name,
      description: e.description ?? undefined,
      attributeIds: e.attributes.map((ea: any) => ea.attributeId),
      position: e.positionX != null && e.positionY != null ? { x: e.positionX, y: e.positionY } : undefined,
    }));

    return NextResponse.json({ data, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch entities', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createEntitySchema.parse(body);

    const created = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const ent = await tx.entity.create({
        data: {
          name: parsed.name,
          description: parsed.description,
          positionX: parsed.position?.x ?? null,
          positionY: parsed.position?.y ?? null,
        },
      });

      if (parsed.attributeIds && parsed.attributeIds.length > 0) {
        await tx.entityAttribute.createMany({
          data: parsed.attributeIds.map((attributeId) => ({ entityId: ent.id, attributeId })),
        });
      }

      const full = await tx.entity.findUnique({
        where: { id: ent.id },
        include: { attributes: { include: { attribute: true } } },
      });

      return {
        id: full!.id,
        name: full!.name,
        description: full!.description ?? undefined,
        attributeIds: full!.attributes.map((ea: any) => ea.attributeId),
        position: full!.positionX != null && full!.positionY != null ? { x: full!.positionX, y: full!.positionY } : undefined,
      };
    });

    return NextResponse.json({ data: created, success: true }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create entity', success: false }, { status: 500 });
  }
}
