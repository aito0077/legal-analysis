import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const data = await req.json();

    // Si no hay sesión, guardamos los datos en localStorage del cliente
    // y retornamos success para que el flujo continúe
    if (!session?.user?.id) {
      // El usuario completará el registro después
      return NextResponse.json(
        {
          success: true,
          requiresAuth: true,
          wizardData: data,
        },
        { status: 200 }
      );
    }

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
        profileId: businessProfile.id,
        overallRiskScore: riskScore || 0,
        riskMatrix: {}, // Can be populated later with detailed matrix
        recommendations: selectedProtocols || [],
      },
    });

    // Save assessment answers
    if (assessmentAnswers) {
      const answerPromises = Object.entries(assessmentAnswers).map(([questionId, answer]) => {
        // For demo purposes, we'll create a simple answer record
        // In production, you'd link to actual AssessmentQuestion records
        return prisma.assessmentAnswer.create({
          data: {
            assessmentId: assessment.id,
            questionId: questionId, // In production, this should be a valid question ID
            answer: JSON.stringify(answer),
          },
        });
      });

      await Promise.all(answerPromises);
    }

    // Assign selected protocols to user
    // For demo, we'll create placeholder protocol assignments
    // In production, you'd have actual Protocol records to link to
    const protocolPromises = selectedProtocols.map((protocolId: string) => {
      return prisma.userProtocol.create({
        data: {
          userId: session.user.id,
          protocolId: protocolId, // In production, link to actual Protocol
          status: 'PENDING',
          progress: 0,
        },
      });
    });

    await Promise.all(protocolPromises);

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
    console.error('Error completing wizard:', error);
    return NextResponse.json(
      { error: 'Error al completar el proceso' },
      { status: 500 }
    );
  }
}
