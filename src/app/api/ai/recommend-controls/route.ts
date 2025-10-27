import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getRiskAIService, UserContext } from '@/lib/ai/risk-ai-service';
import { z } from 'zod';

const recommendControlsSchema = z.object({
  riskId: z.string(),
  count: z.number().min(1).max(10).optional().default(5),
});

// POST /api/ai/recommend-controls - Get AI-powered control recommendations for a risk
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'Servicio de IA no configurado' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { riskId, count } = recommendControlsSchema.parse(body);

    // Get risk event
    const risk = await prisma.riskEvent.findFirst({
      where: {
        id: riskId,
        register: {
          userId: session.user.id,
        },
      },
    });

    if (!risk) {
      return NextResponse.json({ error: 'Riesgo no encontrado' }, { status: 404 });
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        professionalProfile: true,
        businessProfile: true,
      },
    });

    if (!user || !user.profileType) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado' },
        { status: 400 }
      );
    }

    // Build user context
    const context: UserContext = {
      profileType: user.profileType,
      jurisdiction: user.professionalProfile?.jurisdiction || user.businessProfile?.jurisdiction || 'Argentina',
    };

    if (user.profileType === 'PROFESSIONAL' && user.professionalProfile) {
      context.profession = user.professionalProfile.profession;
      context.yearsExperience = user.professionalProfile.yearsExperience || undefined;
      context.practiceAreas = user.professionalProfile.practiceAreas;
    } else if (user.profileType === 'BUSINESS' && user.businessProfile) {
      context.businessType = user.businessProfile.businessType;
      context.companySize = user.businessProfile.companySize;
      context.businessActivities =
        user.businessProfile.businessActivities &&
        typeof user.businessProfile.businessActivities === 'object'
          ? Object.keys(user.businessProfile.businessActivities as object)
          : [];
    }

    // Get AI recommendations
    const aiService = getRiskAIService();
    const recommendations = await aiService.recommendControls(
      risk.title,
      risk.description,
      risk.inherentRisk,
      context,
      count
    );

    return NextResponse.json({ recommendations });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error generating control recommendations:', error);
    return NextResponse.json(
      {
        error: 'Error al generar recomendaciones',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
