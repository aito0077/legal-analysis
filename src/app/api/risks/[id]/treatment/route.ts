import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación
const createTreatmentPlanSchema = z.object({
  strategy: z.enum(['AVOID', 'REDUCE', 'TRANSFER', 'ACCEPT']),
  justification: z.string().optional(),
  actions: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(3),
      description: z.string().optional(),
      responsible: z.string().optional(),
      deadline: z.string().optional(),
      completed: z.boolean().default(false),
    })
  ),
  totalBudget: z.number().optional(),
  timeline: z.string().optional(),
  targetLikelihood: z.enum(['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN']).optional(),
  targetImpact: z.enum(['INSIGNIFICANT', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC']).optional(),
  targetRisk: z.number().optional(),
});

// GET /api/risks/[id]/treatment - Get treatment plan for a risk
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: riskId } = params;

    // Verificar que el riesgo existe y pertenece al usuario
    const riskEvent = await prisma.riskEvent.findFirst({
      where: {
        id: riskId,
        register: {
          userId: session.user.id,
        },
      },
      include: {
        treatmentPlan: true,
      },
    });

    if (!riskEvent) {
      return NextResponse.json({ error: 'Riesgo no encontrado' }, { status: 404 });
    }

    if (!riskEvent.treatmentPlan) {
      return NextResponse.json({ treatmentPlan: null });
    }

    return NextResponse.json({ treatmentPlan: riskEvent.treatmentPlan });
  } catch (error) {
    console.error('Error fetching treatment plan:', error);
    return NextResponse.json({ error: 'Error al cargar plan de tratamiento' }, { status: 500 });
  }
}

// POST /api/risks/[id]/treatment - Create treatment plan
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: riskId } = params;

    // Verificar que el riesgo existe y pertenece al usuario
    const riskEvent = await prisma.riskEvent.findFirst({
      where: {
        id: riskId,
        register: {
          userId: session.user.id,
        },
      },
      include: {
        treatmentPlan: true,
      },
    });

    if (!riskEvent) {
      return NextResponse.json({ error: 'Riesgo no encontrado' }, { status: 404 });
    }

    // Check if treatment plan already exists
    if (riskEvent.treatmentPlan) {
      return NextResponse.json(
        { error: 'Ya existe un plan de tratamiento para este riesgo' },
        { status: 409 }
      );
    }

    const body = await request.json();
    const validatedData = createTreatmentPlanSchema.parse(body);

    // Calculate target risk if likelihood and impact provided
    let targetRisk = validatedData.targetRisk;
    if (validatedData.targetLikelihood && validatedData.targetImpact) {
      const likelihoodMap = { RARE: 1, UNLIKELY: 2, POSSIBLE: 3, LIKELY: 4, ALMOST_CERTAIN: 5 };
      const impactMap = { INSIGNIFICANT: 1, MINOR: 2, MODERATE: 3, MAJOR: 4, CATASTROPHIC: 5 };
      targetRisk =
        likelihoodMap[validatedData.targetLikelihood] * impactMap[validatedData.targetImpact];
    }

    // Crear plan de tratamiento
    const treatmentPlan = await prisma.treatmentPlan.create({
      data: {
        riskEventId: riskId,
        strategy: validatedData.strategy,
        justification: validatedData.justification,
        actions: validatedData.actions,
        totalBudget: validatedData.totalBudget,
        timeline: validatedData.timeline,
        targetLikelihood: validatedData.targetLikelihood,
        targetImpact: validatedData.targetImpact,
        targetRisk,
        status: 'DRAFT',
        progress: 0,
      },
    });

    // Update risk event treatment strategy
    await prisma.riskEvent.update({
      where: { id: riskId },
      data: {
        treatmentStrategy: validatedData.strategy,
        status: 'TREATING',
      },
    });

    return NextResponse.json({ treatmentPlan }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating treatment plan:', error);
    return NextResponse.json({ error: 'Error al crear plan de tratamiento' }, { status: 500 });
  }
}
