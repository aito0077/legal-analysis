import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();

    const {
      profileType,
      // Professional fields
      profession,
      specialty,
      yearsExperience,
      practiceAreas,
      workEnvironment,
      professionalInsurance,
      // Business fields
      businessType,
      companySize,
      revenueRange,
      // Common
      jurisdiction,
      businessActivities,
      riskExposure,
      assessmentAnswers,
      selectedProtocols,
      riskScore,
    } = data;

    let profileId: string;
    let profileName: string;

    // Update user with profileType
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileType: profileType as any },
    });

    // Create profile based on type
    if (profileType === 'PROFESSIONAL') {
      const professionalProfile = await prisma.professionalProfile.create({
        data: {
          userId: session.user.id,
          profession: profession as any,
          specialty,
          yearsExperience,
          jurisdiction,
          practiceAreas: practiceAreas || [],
          workEnvironment: workEnvironment as any,
          professionalInsurance: professionalInsurance || false,
        },
      });
      profileId = professionalProfile.id;
      profileName = `${profession} - ${session.user.name || 'Mi Práctica'}`;
    } else {
      // BUSINESS
      const businessProfile = await prisma.businessProfile.create({
        data: {
          userId: session.user.id,
          businessType: businessType as any,
          companySize: companySize as any,
          jurisdiction,
          revenueRange: revenueRange as any,
          businessActivities: businessActivities || [],
          riskExposure: riskExposure || [],
        },
      });
      profileId = businessProfile.id;
      profileName = `${businessType} - ${session.user.name || 'Mi Empresa'}`;
    }

    // Create Risk Assessment
    const assessment = await prisma.riskAssessment.create({
      data: {
        userId: session.user.id,
        profileId,
        profileType: profileType as any,
        title: 'Evaluación Inicial',
        status: 'COMPLETED',
        overallRiskScore: riskScore || 0,
        riskMatrix: {},
        recommendations: selectedProtocols || [],
        completedAt: new Date(),
      },
    });

    // Create Risk Register
    const riskRegister = await prisma.riskRegister.create({
      data: {
        userId: session.user.id,
        profileId,
        profileType: profileType as any,
        title: `Registro de Riesgos - ${profileName}`,
        jurisdiction,
        status: 'ACTIVE',
      },
    });

    // TODO (Sprint 2): Create RiskEvents based on assessment
    // This will be implemented when we have risk identification logic

    return NextResponse.json(
      {
        success: true,
        profileType,
        profileId,
        assessmentId: assessment.id,
        riskRegisterId: riskRegister.id,
        riskScore,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error completing wizard after signup:', error);
    return NextResponse.json(
      { error: 'Error al completar el proceso', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
