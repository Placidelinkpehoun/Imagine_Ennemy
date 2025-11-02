import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../lib/db';
import { createGameClassSchema } from '../../lib/validations';

export async function GET() {
  try {
    const gameClasses = await db.gameClass.findMany({
      include: {
        attributes: { include: { attribute: true } },
        parent: true,
        children: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = gameClasses.map((gc: any) => ({
      ...gc,
      attributes: gc.attributes.map((ga: any) => ga.attribute),
    }));

    return NextResponse.json({ data, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch game classes', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createGameClassSchema.parse(body);

    const created = await db.$transaction(async (tx) => {
      const gc = await tx.gameClass.create({
        data: {
          name: parsed.name,
          description: parsed.description,
          color: parsed.color,
          parentId: parsed.parentId ?? undefined,
        },
      });

      if (parsed.attributeIds && parsed.attributeIds.length > 0) {
        await tx.gameClassAttribute.createMany({
          data: parsed.attributeIds.map((attributeId) => ({ gameClassId: gc.id, attributeId })),
          skipDuplicates: true,
        });
      }

      const full = await tx.gameClass.findUnique({
        where: { id: gc.id },
        include: { attributes: { include: { attribute: true } }, parent: true, children: true },
      });

      return { ...full, attributes: full?.attributes.map((ga: any) => ga.attribute) };
    });

    return NextResponse.json({ data: created, success: true }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create game class', success: false }, { status: 500 });
  }
}
