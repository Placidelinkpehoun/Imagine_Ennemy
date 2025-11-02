import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../lib/db';
import { createAttributeSchema } from '../../lib/validations';

// GET /api/attributes - List all attributes
export async function GET() {
  try {
    const attributes = await db.attribute.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      data: attributes,
      success: true
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch attributes', success: false },
      { status: 500 }
    );
  }
}

// POST /api/attributes - Create new attribute
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAttributeSchema.parse(body);

    const attribute = await db.attribute.create({
      data: validatedData
    });

    return NextResponse.json({
      data: attribute,
      success: true
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
        success: false
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to create attribute', success: false },
      { status: 500 }
    );
  }
}