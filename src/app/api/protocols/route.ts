import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Get user's assigned protocols
    const userProtocols = await prisma.userProtocol.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status: status as any }),
      },
      include: {
        protocol: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { assignedAt: 'desc' },
      ],
    });

    // Filter by search term if provided
    let filteredProtocols = userProtocols;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProtocols = userProtocols.filter(
        (up) =>
          up.protocol.title.toLowerCase().includes(searchLower) ||
          up.protocol.description.toLowerCase().includes(searchLower)
      );
    }

    // Format response
    const protocols = filteredProtocols.map((up) => ({
      id: up.id,
      protocolId: up.protocolId,
      title: up.protocol.title,
      description: up.protocol.description,
      category: up.protocol.category?.name || 'General',
      status: up.status,
      progress: up.progress,
      assignedAt: up.assignedAt,
      startedAt: up.startedAt,
      completedAt: up.completedAt,
      type: up.protocol.type,
    }));

    // Calculate statistics
    const stats = {
      total: protocols.length,
      pending: protocols.filter((p) => p.status === 'PENDING').length,
      inProgress: protocols.filter((p) => p.status === 'IN_PROGRESS').length,
      completed: protocols.filter((p) => p.status === 'COMPLETED').length,
      archived: protocols.filter((p) => p.status === 'ARCHIVED').length,
      averageProgress: protocols.length > 0
        ? Math.round(protocols.reduce((sum, p) => sum + p.progress, 0) / protocols.length)
        : 0,
    };

    return NextResponse.json({
      protocols,
      stats,
    });
  } catch (error) {
    console.error('Error fetching protocols:', error);
    return NextResponse.json(
      { error: 'Error al cargar protocolos', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
