import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RiskLikelihood, RiskImpactLevel, RiskPriority } from '@prisma/client';

// Helper function to map severity to likelihood and impact
function mapSeverityToRisk(severity: string): { likelihood: RiskLikelihood; impact: RiskImpactLevel } {
  switch (severity) {
    case 'CRITICAL':
      return { likelihood: 'LIKELY', impact: 'CATASTROPHIC' }; // 4 x 5 = 20
    case 'HIGH':
      return { likelihood: 'POSSIBLE', impact: 'MAJOR' }; // 3 x 4 = 12
    case 'MEDIUM':
      return { likelihood: 'POSSIBLE', impact: 'MODERATE' }; // 3 x 3 = 9
    case 'LOW':
      return { likelihood: 'UNLIKELY', impact: 'MINOR' }; // 2 x 2 = 4
    default:
      return { likelihood: 'POSSIBLE', impact: 'MODERATE' }; // Default to medium
  }
}

// Helper function to calculate priority from inherent risk score
function calculatePriority(inherentRisk: number): RiskPriority {
  if (inherentRisk >= 15) return 'CRITICAL'; // 15-25
  if (inherentRisk >= 10) return 'HIGH'; // 10-14
  if (inherentRisk >= 5) return 'MEDIUM'; // 5-9
  return 'LOW'; // 1-4
}

// Helper function to extract category from risk code
function getCategoryFromCode(code: string): string {
  const categoryMap: Record<string, string> = {
    mala_praxis_medica: 'Responsabilidad Profesional',
    mala_praxis_legal: 'Responsabilidad Profesional',
    privacidad_datos_salud: 'Protección de Datos',
    proteccion_datos: 'Protección de Datos',
    incumplimiento_contractual: 'Contractual',
    disputas_clientes: 'Contractual',
    riesgos_laborales: 'Laboral',
    accidentes_trabajo: 'Laboral',
    incumplimiento_regulatorio: 'Regulatorio',
    ciberseguridad: 'Seguridad de la Información',
    propiedad_intelectual: 'Propiedad Intelectual',
    fraude_financiero: 'Financiero',
    responsabilidad_producto: 'Operacional',
    daños_terceros: 'Responsabilidad Civil',
  };

  return categoryMap[code] || 'General';
}

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

    // Create RiskRegister for the user
    const riskRegister = await prisma.riskRegister.create({
      data: {
        userId: session.user.id,
        profileId: profileId,
        profileType: profileType as any,
        title: `Registro de Riesgos - ${profileType === 'PROFESSIONAL' ? profession : businessType}`,
        description: 'Registro inicial de riesgos identificados durante el onboarding',
        jurisdiction: jurisdiction || 'AR',
        status: 'ACTIVE',
        lastReviewedAt: new Date(),
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
      },
    });

    // Create RiskEvents based on riskExposure from wizard
    if (riskExposure && Array.isArray(riskExposure) && riskExposure.length > 0) {
      // Get RiskArea details for each selected risk
      const riskAreas = await prisma.riskArea.findMany({
        where: {
          code: { in: riskExposure },
          isActive: true,
        },
      });

      // Create RiskEvent for each risk area
      const riskEventPromises = riskAreas.map(async (riskArea) => {
        // Map severity to likelihood and impact
        const { likelihood, impact } = mapSeverityToRisk(riskArea.severity || 'MEDIUM');
        const inherentRisk = likelihood * impact;
        const priority = calculatePriority(inherentRisk);

        return prisma.riskEvent.create({
          data: {
            registerId: riskRegister.id,
            title: riskArea.label,
            description: riskArea.description || `Riesgo identificado: ${riskArea.label}`,
            category: getCategoryFromCode(riskArea.code),
            sourceType: 'WIZARD_ASSESSMENT',
            identifiedBy: session.user.name || session.user.email || 'Usuario',
            likelihood,
            impact,
            inherentRisk,
            priority,
            status: 'IDENTIFIED',
            triggers: [],
            consequences: riskArea.examples || [],
            affectedAssets: [],
          },
        });
      });

      await Promise.all(riskEventPromises);
    }

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
