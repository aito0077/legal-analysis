import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/risks/[id] - Get risk details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    const risk = await prisma.riskEvent.findFirst({
      where: {
        id,
        register: {
          userId: session.user.id,
        },
      },
      include: {
        register: {
          select: {
            id: true,
            title: true,
          },
        },
        scenario: {
          select: {
            id: true,
            title: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        controls: {
          include: {
            protocol: {
              select: {
                id: true,
                title: true,
              },
            },
            reviews: {
              orderBy: {
                reviewDate: 'desc',
              },
              take: 1,
            },
          },
          orderBy: [
            { status: 'asc' },
            { createdAt: 'desc' },
          ],
        },
        treatmentPlan: true,
      },
    });

    if (!risk) {
      return NextResponse.json({ error: 'Riesgo no encontrado' }, { status: 404 });
    }

    // Calculate control statistics
    const controlsTotal = risk.controls.length;
    const controlsImplemented = risk.controls.filter((c) =>
      ['IMPLEMENTED', 'OPERATIONAL'].includes(c.status)
    ).length;
    const controlsEffectiveness = controlsTotal > 0
      ? Math.round((controlsImplemented / controlsTotal) * 100)
      : 0;

    return NextResponse.json({
      risk: {
        ...risk,
        controlsCount: controlsTotal,
        controlsImplemented,
        controlsEffectiveness,
      },
    });
  } catch (error) {
    console.error('Error fetching risk:', error);
    return NextResponse.json({ error: 'Error al cargar riesgo' }, { status: 500 });
  }
}
