import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user with profiles and risk register
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        professionalProfile: true,
        businessProfile: true,
        riskRegisters: {
          where: { status: 'ACTIVE' },
          include: {
            riskEvents: {
              include: {
                controls: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the profile based on profileType
    const profile = user.profileType === 'PROFESSIONAL'
      ? user.professionalProfile
      : user.businessProfile;

    // Get active register
    const activeRegister = user.riskRegisters[0];

    // If no register yet, return basic info
    if (!activeRegister) {
      return NextResponse.json({
        user: {
          name: user.name,
          email: user.email,
          profileType: user.profileType,
        },
        profile,
        hasRegister: false,
      });
    }

    // Calculate statistics
    const riskEvents = activeRegister.riskEvents;
    const totalRisks = riskEvents.length;

    // Count by priority
    const criticalRisks = riskEvents.filter(r => r.priority === 'CRITICAL').length;
    const highRisks = riskEvents.filter(r => r.priority === 'HIGH').length;
    const mediumRisks = riskEvents.filter(r => r.priority === 'MEDIUM').length;
    const lowRisks = riskEvents.filter(r => r.priority === 'LOW').length;

    // Calculate average risks
    const averageInherentRisk = totalRisks > 0
      ? riskEvents.reduce((sum, r) => sum + r.inherentRisk, 0) / totalRisks
      : 0;

    const controlledRisks = riskEvents.filter(r => r.residualRisk !== null);
    const averageResidualRisk = controlledRisks.length > 0
      ? controlledRisks.reduce((sum, r) => sum + (r.residualRisk || 0), 0) / controlledRisks.length
      : averageInherentRisk;

    const riskReduction = averageInherentRisk > 0
      ? ((averageInherentRisk - averageResidualRisk) / averageInherentRisk) * 100
      : 0;

    // Get top priority risks
    const topPriorityRisks = riskEvents
      .sort((a, b) => b.inherentRisk - a.inherentRisk)
      .slice(0, 5)
      .map(risk => ({
        id: risk.id,
        title: risk.title,
        category: risk.category,
        priority: risk.priority,
        inherentRisk: risk.inherentRisk,
        residualRisk: risk.residualRisk,
        controlsCount: risk.controls.length,
        controlsImplemented: risk.controls.filter(c => c.status === 'OPERATIONAL').length,
        status: risk.status,
      }));

    // Count controls
    const totalControls = riskEvents.reduce((sum, r) => sum + r.controls.length, 0);
    const implementedControls = riskEvents.reduce(
      (sum, r) => sum + r.controls.filter(c => c.status === 'OPERATIONAL' || c.status === 'IMPLEMENTED').length,
      0
    );

    // Get protocol statistics
    const userProtocols = await prisma.userProtocol.findMany({
      where: { userId: session.user.id },
      include: {
        protocol: true,
      },
    });

    const protocolStats = {
      total: userProtocols.length,
      pending: userProtocols.filter((p) => p.status === 'PENDING').length,
      inProgress: userProtocols.filter((p) => p.status === 'IN_PROGRESS').length,
      completed: userProtocols.filter((p) => p.status === 'COMPLETED').length,
      archived: userProtocols.filter((p) => p.status === 'ARCHIVED').length,
      averageProgress: userProtocols.length > 0
        ? Math.round(userProtocols.reduce((sum, p) => sum + p.progress, 0) / userProtocols.length)
        : 0,
    };

    // Get protocols in progress (top 3)
    const protocolsInProgress = userProtocols
      .filter((p) => p.status === 'IN_PROGRESS')
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        title: p.protocol.title,
        progress: p.progress,
        status: p.status,
        startedAt: p.startedAt,
      }));

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        profileType: user.profileType,
      },
      profile,
      register: {
        id: activeRegister.id,
        title: activeRegister.title,
        jurisdiction: activeRegister.jurisdiction,
        lastReviewedAt: activeRegister.lastReviewedAt,
        nextReviewDate: activeRegister.nextReviewDate,
        status: activeRegister.status,
      },
      summary: {
        totalRisks,
        criticalRisks,
        highRisks,
        mediumRisks,
        lowRisks,
        averageInherentRisk: Math.round(averageInherentRisk * 10) / 10,
        averageResidualRisk: Math.round(averageResidualRisk * 10) / 10,
        riskReduction: Math.round(riskReduction),
        totalControls,
        implementedControls,
        controlImplementationRate: totalControls > 0
          ? Math.round((implementedControls / totalControls) * 100)
          : 0,
      },
      topPriorityRisks,
      protocolStats,
      protocolsInProgress,
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return NextResponse.json(
      { error: 'Error al cargar dashboard', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
