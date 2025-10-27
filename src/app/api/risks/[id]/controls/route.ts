import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación
const createControlSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  type: z.enum(['PREVENTIVE', 'DETECTIVE', 'CORRECTIVE', 'DIRECTIVE']),
  category: z.enum(['ADMINISTRATIVE', 'TECHNICAL', 'PHYSICAL', 'LEGAL']),
  controlStrength: z.enum(['WEAK', 'MODERATE', 'STRONG']),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'IMPLEMENTED', 'OPERATIONAL', 'INEFFECTIVE', 'DEACTIVATED']).optional(),
  owner: z.string().optional(),
  reviewFrequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'ANNUALLY']).optional(),
  estimatedCost: z.number().optional(),
  estimatedEffort: z.enum(['Low', 'Medium', 'High']).optional(),
  protocolId: z.string().optional(),
});

// GET /api/risks/[id]/controls - List controls for a risk
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
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
    });

    if (!riskEvent) {
      return NextResponse.json({ error: 'Riesgo no encontrado' }, { status: 404 });
    }

    // Obtener controles
    const controls = await prisma.riskControl.findMany({
      where: {
        riskEventId: riskId,
      },
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
    });

    return NextResponse.json({ controls });
  } catch (error) {
    console.error('Error fetching controls:', error);
    return NextResponse.json({ error: 'Error al cargar controles' }, { status: 500 });
  }
}

// POST /api/risks/[id]/controls - Create new control
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
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
    });

    if (!riskEvent) {
      return NextResponse.json({ error: 'Riesgo no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = createControlSchema.parse(body);

    // Crear control
    const control = await prisma.riskControl.create({
      data: {
        riskEventId: riskId,
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        category: validatedData.category,
        controlStrength: validatedData.controlStrength,
        status: validatedData.status || 'PLANNED',
        owner: validatedData.owner,
        reviewFrequency: validatedData.reviewFrequency,
        estimatedCost: validatedData.estimatedCost,
        estimatedEffort: validatedData.estimatedEffort,
        protocolId: validatedData.protocolId,
        isCustom: !validatedData.protocolId,
      },
      include: {
        protocol: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Actualizar el riesgo si el control está implementado
    if (validatedData.status === 'IMPLEMENTED' || validatedData.status === 'OPERATIONAL') {
      await recalculateResidualRisk(riskId);
    }

    return NextResponse.json({ control }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating control:', error);
    return NextResponse.json({ error: 'Error al crear control' }, { status: 500 });
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
      residualLikelihood: riskEvent.likelihood, // Simplified - could be more sophisticated
      residualImpact: riskEvent.impact,
    },
  });
}
