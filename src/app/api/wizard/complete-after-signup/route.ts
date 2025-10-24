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
      businessType,
      jurisdiction,
      companySize,
      revenueRange,
      businessActivities,
      riskExposure,
      assessmentAnswers,
      selectedProtocols,
      riskScore,
    } = data;

    // Create Business Profile
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

    // Create Risk Assessment
    const assessment = await prisma.riskAssessment.create({
      data: {
        userId: session.user.id,
        profileId: businessProfile.id,
        title: 'Evaluación Inicial',
        status: 'COMPLETED',
        overallRiskScore: riskScore || 0,
        riskMatrix: {},
        recommendations: selectedProtocols || [],
        completedAt: new Date(),
      },
    });

    // Save assessment answers (skip for now to avoid schema issues)
    // We'll implement this when we have actual questions in the database

    // Create placeholder protocols (skip for now)
    // We'll implement this when we have actual Protocol records

    return NextResponse.json(
      {
        success: true,
        profileId: businessProfile.id,
        assessmentId: assessment.id,
        riskScore,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error completing wizard after signup:', error);
    return NextResponse.json(
      { error: 'Error al completar el proceso' },
      { status: 500 }
    );
  }
}
