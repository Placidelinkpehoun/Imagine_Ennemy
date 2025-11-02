import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';

export async function DELETE(_request: NextRequest, { params }: { params: { id: string; attrId: string } }) {
  try {
    await db.gameClassAttribute.delete({ where: { gameClassId_attributeId: { gameClassId: params.id, attributeId: params.attrId } } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove attribute from class', success: false }, { status: 500 });
  }
}
