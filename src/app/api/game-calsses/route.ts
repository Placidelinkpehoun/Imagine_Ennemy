export async function GET() {
  try {
    const gameClasses = await db.gameClass.findMany({
      include: {
        attributes: {
          include: {
            attribute: true
          }
        },
        parent: true,
        children: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      data: gameClasses,
      success: true
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch game classes', success: false },
      { status: 500 }
    );
  }
}