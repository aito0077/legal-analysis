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
      profileType,
      profession,
      specialty,
      yearsExperience,
      workEnvironment,
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

    let profile;
    let profileId;

    // Check if user already has a profile
    const existingProfessional = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    });
    const existingBusiness = await prisma.businessProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfessional || existingBusiness) {
      // User already completed wizard, redirect to dashboard
      return NextResponse.json(
        {
          success: true,
          alreadyCompleted: true,
          profileId: existingProfessional?.id || existingBusiness?.id,
          profileType: existingProfessional ? 'PROFESSIONAL' : 'BUSINESS',
          message: 'Ya has completado el wizard. Redirigiendo al dashboard...',
        },
        { status: 200 }
      );
    }

    // Create profile based on profileType
    if (profileType === 'PROFESSIONAL') {
      // Create Professional Profile
      profile = await prisma.professionalProfile.create({
        data: {
          userId: session.user.id,
          profession: profession as any,
          specialty: specialty || null,
          yearsExperience: yearsExperience || null,
          jurisdiction: jurisdiction || 'AR',
          workEnvironment: workEnvironment as any || null,
          professionalInsurance: false, // Can be updated later
        },
      });
      profileId = profile.id;
    } else {
      // Create Business Profile
      profile = await prisma.businessProfile.create({
        data: {
          userId: session.user.id,
          businessType: businessType as any,
          companySize: companySize as any,
          jurisdiction: jurisdiction || 'AR',
          revenueRange: revenueRange as any || null,
          businessActivities: businessActivities || [],
          riskExposure: riskExposure || [],
        },
      });
      profileId = profile.id;
    }

    // Update user profileType
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileType: profileType as any },
    });

    // Create Risk Assessment
    const assessment = await prisma.riskAssessment.create({
      data: {
        userId: session.user.id,
        profileType: profileType as any,
        // Set the appropriate profile ID based on profileType
        professionalProfileId: profileType === 'PROFESSIONAL' ? profileId : null,
        businessProfileId: profileType === 'BUSINESS' ? profileId : null,
        title: `Evaluación Inicial - ${new Date().toLocaleDateString('es-AR')}`,
        overallRiskScore: riskScore || 0,
        riskMatrix: {}, // Can be populated later with detailed matrix
        recommendations: selectedProtocols || [],
      },
    });

    // TODO: Save assessment answers
    // Currently skipped because we need to create AssessmentQuestion records first
    // if (assessmentAnswers) {
    //   const answerPromises = Object.entries(assessmentAnswers).map(([questionId, answer]) => {
    //     return prisma.assessmentAnswer.create({
    //       data: {
    //         assessmentId: assessment.id,
    //         questionId: questionId,
    //         response: answer,
    //       },
    //     });
    //   });
    //   await Promise.all(answerPromises);
    // }

    // TODO: Assign selected protocols to user
    // Currently skipped because we need to create Protocol records first
    // if (selectedProtocols && selectedProtocols.length > 0) {
    //   const protocolPromises = selectedProtocols.map((protocolId: string) => {
    //     return prisma.userProtocol.create({
    //       data: {
    //         userId: session.user.id,
    //         protocolId: protocolId,
    //         status: 'PENDING',
    //         progress: 0,
    //       },
    //     });
    //   });
    //   await Promise.all(protocolPromises);
    // }

    return NextResponse.json(
      {
        success: true,
        profileId: profileId,
        profileType: profileType,
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
