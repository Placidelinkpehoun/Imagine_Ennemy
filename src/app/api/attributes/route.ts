import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../lib/db';
import { createAttributeSchema } from '../../lib/validations';

export async function GET() {
  try {
    const attributes = await db.attribute.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ data: attributes, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attributes', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createAttributeSchema.parse(body);
    const attribute = await db.attribute.upsert({
      where: { name: parsed.name },
      update: { description: parsed.description },
      create: parsed,
    });
    const status = attribute ? 200 : 201;
    return NextResponse.json({ data: attribute, success: true }, { status });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create attribute', success: false }, { status: 500 });
  }
}

const updateSchema = createAttributeSchema.partial();

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateSchema.extend({ id: z.string().cuid() }).parse(body);
    const updated = await db.attribute.update({ where: { id: parsed.id }, data: parsed });
    return NextResponse.json({ data: updated, success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update attribute', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const parsed = z.object({ id: z.string().cuid() }).parse({ id });
    await db.attribute.delete({ where: { id: parsed.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete attribute', success: false }, { status: 500 });
  }
}
