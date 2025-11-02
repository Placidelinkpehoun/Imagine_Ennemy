import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../lib/db';

const createSchema = z.object({
  entityId: z.string().cuid(),
  attributeId: z.string().cuid(),
  text: z.string().min(1),
  position: z
    .object({ x: z.number(), y: z.number() })
    .optional(),
});

const patchSchema = z.object({
  id: z.string().cuid(),
  text: z.string().min(1).optional(),
  position: z
    .object({ x: z.number(), y: z.number() })
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId') || undefined;
    const attributeId = searchParams.get('attributeId') || undefined;

    const where: any = {};
    if (entityId) where.entityId = entityId;
    if (attributeId) where.attributeId = attributeId;

    const rows = await db.attributeSpecificity.findMany({ where });
    const data = rows.map((r) => ({
      id: r.id,
      entityId: r.entityId,
      attributeId: r.attributeId,
      text: r.text,
      position: r.posX != null && r.posY != null ? { x: r.posX, y: r.posY } : undefined,
    }));

    return NextResponse.json({ data, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch specificities', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSchema.parse(body);

    const created = await db.attributeSpecificity.upsert({
      where: { entityId_attributeId: { entityId: parsed.entityId, attributeId: parsed.attributeId } },
      create: {
        entityId: parsed.entityId,
        attributeId: parsed.attributeId,
        text: parsed.text,
        posX: parsed.position?.x ?? null,
        posY: parsed.position?.y ?? null,
      },
      update: {
        text: parsed.text,
        posX: parsed.position?.x ?? null,
        posY: parsed.position?.y ?? null,
      },
    });

    const data = {
      id: created.id,
      entityId: created.entityId,
      attributeId: created.attributeId,
      text: created.text,
      position: created.posX != null && created.posY != null ? { x: created.posX, y: created.posY } : undefined,
    };

    return NextResponse.json({ data, success: true }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create specificity', success: false }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = patchSchema.parse(body);

    const updated = await db.attributeSpecificity.update({
      where: { id: parsed.id },
      data: {
        text: parsed.text,
        posX: parsed.position?.x ?? undefined,
        posY: parsed.position?.y ?? undefined,
      },
    });

    const data = {
      id: updated.id,
      entityId: updated.entityId,
      attributeId: updated.attributeId,
      text: updated.text,
      position: updated.posX != null && updated.posY != null ? { x: updated.posX, y: updated.posY } : undefined,
    };

    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update specificity', success: false }, { status: 500 });
  }
}
