import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateControlSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  type: z.enum(['PREVENTIVE', 'DETECTIVE', 'CORRECTIVE', 'DIRECTIVE']).optional(),
  category: z.enum(['ADMINISTRATIVE', 'TECHNICAL', 'PHYSICAL', 'LEGAL']).optional(),
  controlStrength: z.enum(['WEAK', 'MODERATE', 'STRONG']).optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'IMPLEMENTED', 'OPERATIONAL', 'INEFFECTIVE', 'DEACTIVATED']).optional(),
  owner: z.string().optional().nullable(),
  reviewFrequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'ANNUALLY']).optional().nullable(),
  estimatedCost: z.number().optional().nullable(),
  estimatedEffort: z.enum(['Low', 'Medium', 'High']).optional().nullable(),
  implementationDate: z.string().optional().nullable(),
});

// GET /api/risks/[id]/controls/[controlId] - Get control details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; controlId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: riskId, controlId } = params;

    const control = await prisma.riskControl.findFirst({
      where: {
        id: controlId,
        riskEventId: riskId,
        riskEvent: {
          register: {
            userId: session.user.id,
          },
        },
      },
      include: {
        protocol: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        reviews: {
          orderBy: {
            reviewDate: 'desc',
          },
        },
      },
    });

    if (!control) {
      return NextResponse.json({ error: 'Control no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ control });
  } catch (error) {
    console.error('Error fetching control:', error);
    return NextResponse.json({ error: 'Error al cargar control' }, { status: 500 });
  }
}

// PUT /api/risks/[id]/controls/[controlId] - Update control
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; controlId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: riskId, controlId } = params;

    // Verify control exists and belongs to user
    const existingControl = await prisma.riskControl.findFirst({
      where: {
        id: controlId,
        riskEventId: riskId,
        riskEvent: {
          register: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!existingControl) {
      return NextResponse.json({ error: 'Control no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateControlSchema.parse(body);

    // Prepare update data
    const updateData: any = {};
    Object.keys(validatedData).forEach((key) => {
      const value = (validatedData as any)[key];
      if (value !== undefined) {
        if (key === 'implementationDate' && value) {
          updateData[key] = new Date(value);
        } else {
          updateData[key] = value;
        }
      }
    });

    // Update control
    const control = await prisma.riskControl.update({
      where: { id: controlId },
      data: updateData,
      include: {
        protocol: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Recalculate residual risk if status changed to implemented/operational
    if (validatedData.status && ['IMPLEMENTED', 'OPERATIONAL'].includes(validatedData.status)) {
      await recalculateResidualRisk(riskId);
    }

    return NextResponse.json({ control });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating control:', error);
    return NextResponse.json({ error: 'Error al actualizar control' }, { status: 500 });
  }
}

// DELETE /api/risks/[id]/controls/[controlId] - Delete control
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; controlId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: riskId, controlId } = params;

    // Verify control exists and belongs to user
    const existingControl = await prisma.riskControl.findFirst({
      where: {
        id: controlId,
        riskEventId: riskId,
        riskEvent: {
          register: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!existingControl) {
      return NextResponse.json({ error: 'Control no encontrado' }, { status: 404 });
    }

    // Delete control (cascade will delete reviews)
    await prisma.riskControl.delete({
      where: { id: controlId },
    });

    // Recalculate residual risk
    await recalculateResidualRisk(riskId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting control:', error);
    return NextResponse.json({ error: 'Error al eliminar control' }, { status: 500 });
  }
}

// Helper function to recalculate residual risk
async function recalculateResidualRisk(riskEventId: string) {
  const riskEvent = await prisma.riskEvent.findUnique({
    where: { id: riskEventId },
    include: {
      controls: {
        where: {
          status: {
            in: ['IMPLEMENTED', 'OPERATIONAL'],
          },
        },
      },
    },
  });

  if (!riskEvent) return;

  const { inherentRisk, controls } = riskEvent;

  if (controls.length === 0) {
    // No controls - set residual equal to inherent
    await prisma.riskEvent.update({
      where: { id: riskEventId },
      data: {
        residualRisk: null,
        residualLikelihood: null,
        residualImpact: null,
      },
    });
    return;
  }

  // Calculate reduction based on control strength
  let totalReduction = 0;
  controls.forEach((control) => {
    if (control.controlStrength === 'WEAK') totalReduction += 1;
    if (control.controlStrength === 'MODERATE') totalReduction += 2;
    if (control.controlStrength === 'STRONG') totalReduction += 3;
  });

  // Cap reduction at 80% of inherent risk
  const maxReduction = Math.floor(inherentRisk * 0.8);
  totalReduction = Math.min(totalReduction, maxReduction);

  const residualRisk = Math.max(1, inherentRisk - totalReduction);

  // Update risk event
  await prisma.riskEvent.update({
    where: { id: riskEventId },
    data: {
      residualRisk,
      residualLikelihood: riskEvent.likelihood,
      residualImpact: riskEvent.impact,
    },
  });
}
