import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; attrId: string }> }) {
  try {
    const { id, attrId } = await params;
    await db.gameClassAttribute.delete({ where: { gameClassId_attributeId: { gameClassId: id, attributeId: attrId } } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove attribute from class', success: false }, { status: 500 });
  }
}
