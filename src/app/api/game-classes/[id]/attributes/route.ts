import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../../../lib/db';

const schema = z.object({ attributeId: z.string().cuid() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = schema.parse(body);

    const existing = await db.gameClassAttribute.findUnique({
      where: { gameClassId_attributeId: { gameClassId: id, attributeId: parsed.attributeId } },
    });
    if (existing) {
      return NextResponse.json({ success: true, message: 'Already linked' }, { status: 409 });
    }

    await db.gameClassAttribute.create({
      data: { gameClassId: id, attributeId: parsed.attributeId },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add attribute to class', success: false }, { status: 500 });
  }
}
