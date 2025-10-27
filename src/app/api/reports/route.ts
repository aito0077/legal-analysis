import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get user's active risk register
    const activeRegister = await prisma.riskRegister.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
      include: {
        riskEvents: {
          include: {
            controls: true,
          },
        },
      },
    });

    if (!activeRegister) {
      return NextResponse.json({
        hasData: false,
        message: 'No hay registro de riesgos activo',
      });
    }

    const riskEvents = activeRegister.riskEvents;

    // Calculate risk matrix data (5x5 grid)
    const riskMatrix = {
      data: [] as Array<{ likelihood: number; impact: number; count: number; risks: any[] }>,
    };

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

    // Initialize 5x5 matrix
    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        riskMatrix.data.push({
          likelihood: l,
          impact: i,
          count: 0,
          risks: [],
        });
      }
    }

    // Populate matrix with risks
    riskEvents.forEach((risk) => {
      const l = likelihoodValues[risk.likelihood] || 3;
      const i = impactValues[risk.impact] || 3;

      const cell = riskMatrix.data.find(
        (cell) => cell.likelihood === l && cell.impact === i
      );

      if (cell) {
        cell.count++;
        cell.risks.push({
          id: risk.id,
          title: risk.title,
          priority: risk.priority,
          inherentRisk: risk.inherentRisk,
        });
      }
    });

    // Distribution by priority
    const priorityDistribution = {
      CRITICAL: riskEvents.filter((r) => r.priority === 'CRITICAL').length,
      HIGH: riskEvents.filter((r) => r.priority === 'HIGH').length,
      MEDIUM: riskEvents.filter((r) => r.priority === 'MEDIUM').length,
      LOW: riskEvents.filter((r) => r.priority === 'LOW').length,
    };

    // Distribution by status
    const statusDistribution = {
      IDENTIFIED: riskEvents.filter((r) => r.status === 'IDENTIFIED').length,
      ANALYZING: riskEvents.filter((r) => r.status === 'ANALYZING').length,
      MITIGATING: riskEvents.filter((r) => r.status === 'MITIGATING').length,
      MONITORING: riskEvents.filter((r) => r.status === 'MONITORING').length,
      CLOSED: riskEvents.filter((r) => r.status === 'CLOSED').length,
    };

    // Distribution by category
    const categoryDistribution = riskEvents.reduce((acc: Record<string, number>, risk) => {
      const category = risk.category || 'Sin categoría';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Top risks
    const topRisks = riskEvents
      .sort((a, b) => b.inherentRisk - a.inherentRisk)
      .slice(0, 10)
      .map((risk) => ({
        id: risk.id,
        title: risk.title,
        category: risk.category,
        priority: risk.priority,
        inherentRisk: risk.inherentRisk,
        residualRisk: risk.residualRisk,
        status: risk.status,
        controlsCount: risk.controls.length,
        controlsImplemented: risk.controls.filter(
          (c) => c.status === 'OPERATIONAL' || c.status === 'IMPLEMENTED'
        ).length,
      }));

    // Risk trends (simplified - group by creation month)
    const riskTrends = riskEvents.reduce((acc: Record<string, number>, risk) => {
      const month = new Date(risk.createdAt).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // Calculate overall metrics
    const totalRisks = riskEvents.length;
    const averageInherentRisk =
      totalRisks > 0
        ? riskEvents.reduce((sum, r) => sum + r.inherentRisk, 0) / totalRisks
        : 0;

    const risksWithControls = riskEvents.filter((r) => r.controls.length > 0);
    const averageResidualRisk =
      risksWithControls.length > 0
        ? risksWithControls.reduce((sum, r) => sum + (r.residualRisk || r.inherentRisk), 0) /
          risksWithControls.length
        : averageInherentRisk;

    const riskReduction =
      averageInherentRisk > 0
        ? ((averageInherentRisk - averageResidualRisk) / averageInherentRisk) * 100
        : 0;

    const totalControls = riskEvents.reduce((sum, r) => sum + r.controls.length, 0);
    const implementedControls = riskEvents.reduce(
      (sum, r) =>
        sum + r.controls.filter((c) => c.status === 'OPERATIONAL' || c.status === 'IMPLEMENTED').length,
      0
    );

    // Control effectiveness
    const controlEffectiveness = {
      total: totalControls,
      implemented: implementedControls,
      percentage: totalControls > 0 ? Math.round((implementedControls / totalControls) * 100) : 0,
    };

    // Get user protocols for additional insights
    const userProtocols = await prisma.userProtocol.findMany({
      where: { userId: session.user.id },
    });

    const protocolStats = {
      total: userProtocols.length,
      completed: userProtocols.filter((p) => p.status === 'COMPLETED').length,
      inProgress: userProtocols.filter((p) => p.status === 'IN_PROGRESS').length,
      averageProgress:
        userProtocols.length > 0
          ? Math.round(userProtocols.reduce((sum, p) => sum + p.progress, 0) / userProtocols.length)
          : 0,
    };

    return NextResponse.json({
      hasData: true,
      register: {
        id: activeRegister.id,
        title: activeRegister.title,
        lastReviewedAt: activeRegister.lastReviewedAt,
        nextReviewDate: activeRegister.nextReviewDate,
      },
      summary: {
        totalRisks,
        averageInherentRisk: Math.round(averageInherentRisk * 10) / 10,
        averageResidualRisk: Math.round(averageResidualRisk * 10) / 10,
        riskReduction: Math.round(riskReduction),
      },
      riskMatrix,
      priorityDistribution,
      statusDistribution,
      categoryDistribution,
      topRisks,
      riskTrends,
      controlEffectiveness,
      protocolStats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Error al generar reporte' },
      { status: 500 }
    );
  }
}
