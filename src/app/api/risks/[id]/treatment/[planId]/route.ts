import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateTreatmentPlanSchema = z.object({
  strategy: z.enum(['AVOID', 'REDUCE', 'TRANSFER', 'ACCEPT']).optional(),
  justification: z.string().optional().nullable(),
  actions: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(3),
      description: z.string().optional(),
      responsible: z.string().optional(),
      deadline: z.string().optional(),
      completed: z.boolean().default(false),
    })
  ).optional(),
  totalBudget: z.number().optional().nullable(),
  timeline: z.string().optional().nullable(),
  targetLikelihood: z.enum(['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN']).optional().nullable(),
  targetImpact: z.enum(['INSIGNIFICANT', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC']).optional().nullable(),
  targetRisk: z.number().optional().nullable(),
  status: z.enum(['DRAFT', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).optional(),
  progress: z.number().min(0).max(100).optional(),
  approvedBy: z.string().optional().nullable(),
});

// GET /api/risks/[id]/treatment/[planId] - Get treatment plan details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; planId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { planId } = params;

    const treatmentPlan = await prisma.treatmentPlan.findFirst({
      where: {
        id: planId,
        riskEvent: {
          register: {
            userId: session.user.id,
          },
        },
      },
      include: {
        riskEvent: {
          select: {
            id: true,
            title: true,
            inherentRisk: true,
            residualRisk: true,
          },
        },
      },
    });

    if (!treatmentPlan) {
      return NextResponse.json({ error: 'Plan de tratamiento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ treatmentPlan });
  } catch (error) {
    console.error('Error fetching treatment plan:', error);
    return NextResponse.json({ error: 'Error al cargar plan de tratamiento' }, { status: 500 });
  }
}

// PUT /api/risks/[id]/treatment/[planId] - Update treatment plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; planId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: riskId, planId } = params;

    // Verify treatment plan exists and belongs to user
    const existingPlan = await prisma.treatmentPlan.findFirst({
      where: {
        id: planId,
        riskEventId: riskId,
        riskEvent: {
          register: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan de tratamiento no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateTreatmentPlanSchema.parse(body);

    // Prepare update data
    const updateData: any = {};
    Object.keys(validatedData).forEach((key) => {
      const value = (validatedData as any)[key];
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    // Recalculate target risk if likelihood/impact changed
    if (validatedData.targetLikelihood && validatedData.targetImpact) {
      const likelihoodMap = { RARE: 1, UNLIKELY: 2, POSSIBLE: 3, LIKELY: 4, ALMOST_CERTAIN: 5 };
      const impactMap = { INSIGNIFICANT: 1, MINOR: 2, MODERATE: 3, MAJOR: 4, CATASTROPHIC: 5 };
      updateData.targetRisk =
        likelihoodMap[validatedData.targetLikelihood] * impactMap[validatedData.targetImpact];
    }

    // Set timestamps based on status changes
    if (validatedData.status) {
      if (validatedData.status === 'APPROVED' && !existingPlan.approvedAt) {
        updateData.approvedAt = new Date();
        if (validatedData.approvedBy) {
          updateData.approvedBy = validatedData.approvedBy;
        }
      }
      if (validatedData.status === 'IN_PROGRESS' && !existingPlan.startedAt) {
        updateData.startedAt = new Date();
      }
      if (validatedData.status === 'COMPLETED' && !existingPlan.completedAt) {
        updateData.completedAt = new Date();
        updateData.progress = 100;
      }
    }

    // Update treatment plan
    const treatmentPlan = await prisma.treatmentPlan.update({
      where: { id: planId },
      data: updateData,
    });

    // Update risk event status if treatment plan completed
    if (validatedData.status === 'COMPLETED') {
      await prisma.riskEvent.update({
        where: { id: riskId },
        data: {
          status: 'MONITORING',
        },
      });
    }

    return NextResponse.json({ treatmentPlan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating treatment plan:', error);
    return NextResponse.json({ error: 'Error al actualizar plan de tratamiento' }, { status: 500 });
  }
}

// DELETE /api/risks/[id]/treatment/[planId] - Delete treatment plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; planId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: riskId, planId } = params;

    // Verify treatment plan exists and belongs to user
    const existingPlan = await prisma.treatmentPlan.findFirst({
      where: {
        id: planId,
        riskEventId: riskId,
        riskEvent: {
          register: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan de tratamiento no encontrado' }, { status: 404 });
    }

    // Delete treatment plan
    await prisma.treatmentPlan.delete({
      where: { id: planId },
    });

    // Reset risk event treatment strategy
    await prisma.riskEvent.update({
      where: { id: riskId },
      data: {
        treatmentStrategy: null,
        status: 'EVALUATED',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting treatment plan:', error);
    return NextResponse.json({ error: 'Error al eliminar plan de tratamiento' }, { status: 500 });
  }
}
