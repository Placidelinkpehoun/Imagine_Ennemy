import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../../lib/db';
import { createGameClassSchema } from '../../../lib/validations';
import { Prisma } from '@prisma/client';

const updateSchema = createGameClassSchema.partial();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.parse(body);

    const updated = await db.gameClass.update({
      where: { id },
      data: {
        name: parsed.name,
        description: parsed.description,
        color: parsed.color,
        parentId: parsed.parentId,
      },
      include: { attributes: { include: { attribute: true } }, parent: true, children: true },
    });

    const data = { ...updated, attributes: updated.attributes.map((ga: any) => ga.attribute) };

    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update game class', success: false }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Délier les enfants (éviter contrainte FK sur parentId)
      await tx.gameClass.updateMany({ where: { parentId: id }, data: { parentId: null } });
      // Supprimer les relations attributs
      await tx.gameClassAttribute.deleteMany({ where: { gameClassId: id } });
      // Supprimer la classe
      await tx.gameClass.delete({ where: { id } });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete game class', success: false }, { status: 500 });
  }
}
