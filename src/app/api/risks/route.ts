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
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Get user's active risk register
    const activeRegister = await prisma.riskRegister.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (!activeRegister) {
      return NextResponse.json({
        risks: [],
        stats: {
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          byStatus: {},
          byCategory: {},
        },
      });
    }

    // Build where clause for filtering
    const whereClause: any = {
      registerId: activeRegister.id,
    };

    if (priority) {
      whereClause.priority = priority;
    }

    if (status) {
      whereClause.status = status;
    }

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get risk events with controls
    const riskEvents = await prisma.riskEvent.findMany({
      where: whereClause,
      include: {
        controls: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Format risks for response
    const risks = riskEvents.map((risk) => ({
      id: risk.id,
      title: risk.title,
      description: risk.description,
      category: risk.category,
      priority: risk.priority,
      status: risk.status,
      likelihood: risk.likelihood,
      impact: risk.impact,
      inherentRisk: risk.inherentRisk,
      residualRisk: risk.residualRisk,
      controlsCount: risk.controls.length,
      controlsImplemented: risk.controls.filter(
        (c) => c.status === 'OPERATIONAL' || c.status === 'IMPLEMENTED'
      ).length,
      identifiedBy: risk.identifiedBy,
      createdAt: risk.createdAt,
      updatedAt: risk.updatedAt,
    }));

    // Calculate statistics
    const stats = {
      total: risks.length,
      critical: risks.filter((r) => r.priority === 'CRITICAL').length,
      high: risks.filter((r) => r.priority === 'HIGH').length,
      medium: risks.filter((r) => r.priority === 'MEDIUM').length,
      low: risks.filter((r) => r.priority === 'LOW').length,
      byStatus: risks.reduce((acc: Record<string, number>, risk) => {
        acc[risk.status] = (acc[risk.status] || 0) + 1;
        return acc;
      }, {}),
      byCategory: risks.reduce((acc: Record<string, number>, risk) => {
        const cat = risk.category || 'Sin categoría';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {}),
    };

    return NextResponse.json({
      risks,
      stats,
      registerId: activeRegister.id,
    });
  } catch (error) {
    console.error('Error fetching risks:', error);
    return NextResponse.json(
      { error: 'Error al cargar riesgos' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();
    const {
      title,
      description,
      category,
      likelihood,
      impact,
      triggers,
      consequences,
      affectedAssets,
      sourceType = 'MANUAL_ENTRY',
    } = data;

    // Validate required fields
    if (!title || !likelihood || !impact) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: title, likelihood, impact' },
        { status: 400 }
      );
    }

    // Get or create active risk register
    let activeRegister = await prisma.riskRegister.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (!activeRegister) {
      // Create a new risk register if none exists
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          professionalProfile: true,
          businessProfile: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }

      const profileId = user.professionalProfile?.id || user.businessProfile?.id;
      const profileType = user.profileType;

      activeRegister = await prisma.riskRegister.create({
        data: {
          userId: session.user.id,
          profileId: profileId!,
          profileType: profileType as any,
          title: `Registro de Riesgos - ${new Date().toLocaleDateString('es-AR')}`,
          description: 'Registro principal de riesgos',
          jurisdiction: user.professionalProfile?.jurisdiction || user.businessProfile?.jurisdiction || 'AR',
          status: 'ACTIVE',
          lastReviewedAt: new Date(),
          nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        },
      });
    }

    // Calculate inherent risk score (likelihood x impact)
    const likelihoodValues: Record<string, number> = {
      RARE: 1,
      UNLIKELY: 2,
      POSSIBLE: 3,
      LIKELY: 4,
      ALMOST_CERTAIN: 5,
    };

    const impactValues: Record<string, number> = {
      INSIGNIFICANT: 1,
      MINOR: 2,
      MODERATE: 3,
      MAJOR: 4,
      CATASTROPHIC: 5,
    };

    const likelihoodScore = likelihoodValues[likelihood] || 3;
    const impactScore = impactValues[impact] || 3;
    const inherentRisk = likelihoodScore * impactScore;

    // Calculate priority based on inherent risk
    let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    if (inherentRisk >= 15) {
      priority = 'CRITICAL';
    } else if (inherentRisk >= 10) {
      priority = 'HIGH';
    } else if (inherentRisk >= 5) {
      priority = 'MEDIUM';
    } else {
      priority = 'LOW';
    }

    // Create risk event
    const riskEvent = await prisma.riskEvent.create({
      data: {
        registerId: activeRegister.id,
        title,
        description: description || '',
        category: category || 'General',
        sourceType,
        identifiedBy: session.user.name || session.user.email || 'Usuario',
        likelihood,
        impact,
        inherentRisk,
        priority,
        status: 'IDENTIFIED',
        triggers: triggers || [],
        consequences: consequences || [],
        affectedAssets: affectedAssets || [],
      },
    });

    return NextResponse.json(
      {
        success: true,
        risk: riskEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating risk:', error);
    return NextResponse.json(
      { error: 'Error al crear riesgo' },
      { status: 500 }
    );
  }
}
