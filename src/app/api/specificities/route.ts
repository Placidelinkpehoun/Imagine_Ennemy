import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../lib/db';

const createSchema = z.object({
  text: z.string().min(1),
  position: z
    .object({ x: z.number(), y: z.number() })
    .optional(),
  attributeConnections: z.array(
    z.object({
      entityId: z.string().cuid(),
      attributeId: z.string().cuid(),
    })
  ).min(1),
});

const patchSchema = z.object({
  id: z.string().cuid(),
  text: z.string().min(1).optional(),
  position: z
    .object({ x: z.number(), y: z.number() })
    .optional(),
});

const addConnectionSchema = z.object({
  specificityId: z.string().cuid(),
  entityId: z.string().cuid(),
  attributeId: z.string().cuid(),
});

const removeConnectionSchema = z.object({
  connectionId: z.string().cuid(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId') || undefined;

    const rows = await db.specificity.findMany({
      include: {
        attributes: {
          where: entityId ? { entityId } : undefined,
        },
      },
    });

    const data = rows.map((r) => ({
      id: r.id,
      text: r.text,
      position: r.posX != null && r.posY != null ? { x: r.posX, y: r.posY } : undefined,
      attributeConnections: r.attributes.map((a) => ({
        id: a.id,
        specificityId: a.specificityId,
        entityId: a.entityId,
        attributeId: a.attributeId,
      })),
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

    const created = await db.specificity.create({
      data: {
        text: parsed.text,
        posX: parsed.position?.x ?? null,
        posY: parsed.position?.y ?? null,
        attributes: {
          create: parsed.attributeConnections.map((conn) => ({
            entityId: conn.entityId,
            attributeId: conn.attributeId,
          })),
        },
      },
      include: {
        attributes: true,
      },
    });

    const data = {
      id: created.id,
      text: created.text,
      position: created.posX != null && created.posY != null ? { x: created.posX, y: created.posY } : undefined,
      attributeConnections: created.attributes.map((a) => ({
        id: a.id,
        specificityId: a.specificityId,
        entityId: a.entityId,
        attributeId: a.attributeId,
      })),
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

    const updated = await db.specificity.update({
      where: { id: parsed.id },
      data: {
        text: parsed.text,
        posX: parsed.position?.x ?? undefined,
        posY: parsed.position?.y ?? undefined,
      },
      include: {
        attributes: true,
      },
    });

    const data = {
      id: updated.id,
      text: updated.text,
      position: updated.posX != null && updated.posY != null ? { x: updated.posX, y: updated.posY } : undefined,
      attributeConnections: updated.attributes.map((a) => ({
        id: a.id,
        specificityId: a.specificityId,
        entityId: a.entityId,
        attributeId: a.attributeId,
      })),
    };

    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update specificity', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'addConnection') {
      const parsed = addConnectionSchema.parse(body);
      const connection = await db.specificityAttribute.create({
        data: {
          specificityId: parsed.specificityId,
          entityId: parsed.entityId,
          attributeId: parsed.attributeId,
        },
      });

      return NextResponse.json({ data: connection, success: true });
    } else if (action === 'removeConnection') {
      const parsed = removeConnectionSchema.parse(body);
      await db.specificityAttribute.delete({
        where: { id: parsed.connectionId },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action', success: false }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update connection', success: false }, { status: 500 });
  }
}
