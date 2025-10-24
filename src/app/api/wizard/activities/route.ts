import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Profession, BusinessType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profileType = searchParams.get('profileType'); // 'PROFESSIONAL' | 'BUSINESS'
    const profession = searchParams.get('profession'); // e.g., 'DOCTOR'
    const businessType = searchParams.get('businessType'); // e.g., 'HEALTHCARE'

    if (!profileType) {
      return NextResponse.json({ error: 'profileType is required' }, { status: 400 });
    }

    let activities = [];
    let riskAreas = [];

    if (profileType === 'PROFESSIONAL') {
      if (!profession) {
        return NextResponse.json({ error: 'profession is required for professionals' }, { status: 400 });
      }

      // Obtener actividades para esta profesión
      activities = await prisma.activity.findMany({
        where: {
          isActive: true,
          professions: {
            hasSome: [profession as Profession],
          },
        },
        orderBy: [{ category: 'asc' }, { order: 'asc' }],
      });

      // Obtener áreas de riesgo para esta profesión
      riskAreas = await prisma.riskArea.findMany({
        where: {
          isActive: true,
          professions: {
            hasSome: [profession as Profession],
          },
        },
        orderBy: [
          { severity: 'desc' }, // HIGH primero
          { order: 'asc' },
        ],
      });
    } else if (profileType === 'BUSINESS') {
      if (!businessType) {
        return NextResponse.json({ error: 'businessType is required for businesses' }, { status: 400 });
      }

      // Obtener actividades para este tipo de negocio
      activities = await prisma.activity.findMany({
        where: {
          isActive: true,
          businessTypes: {
            hasSome: [businessType as BusinessType],
          },
        },
        orderBy: [{ category: 'asc' }, { order: 'asc' }],
      });

      // Obtener áreas de riesgo para este tipo de negocio
      riskAreas = await prisma.riskArea.findMany({
        where: {
          isActive: true,
          businessTypes: {
            hasSome: [businessType as BusinessType],
          },
        },
        orderBy: [
          { severity: 'desc' }, // HIGH primero
          { order: 'asc' },
        ],
      });
    } else {
      return NextResponse.json({ error: 'Invalid profileType' }, { status: 400 });
    }

    return NextResponse.json({
      activities: activities.map((a) => ({
        code: a.code,
        label: a.label,
        description: a.description,
        category: a.category,
      })),
      riskAreas: riskAreas.map((r) => ({
        code: r.code,
        label: r.label,
        description: r.description,
        severity: r.severity,
        examples: r.examples,
      })),
    });
  } catch (error) {
    console.error('Error fetching wizard activities:', error);
    return NextResponse.json(
      { error: 'Error al cargar actividades', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
