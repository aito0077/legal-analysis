import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BusinessType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessType = searchParams.get('businessType');
    const jurisdiction = searchParams.get('jurisdiction');
    const category = searchParams.get('category');

    // Build where clause
    const whereClause: any = {
      isPublic: true,
      type: 'SYSTEM', // Only show official protocols
    };

    // Filter by business type if provided
    if (businessType) {
      whereClause.businessTypes = {
        has: businessType as BusinessType,
      };
    }

    // Filter by jurisdiction if provided
    if (jurisdiction) {
      whereClause.jurisdictions = {
        has: jurisdiction,
      };
    }

    // Filter by category if provided
    if (category) {
      whereClause.categoryId = category;
    }

    // Fetch protocols from database
    const protocols = await prisma.protocol.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Format response
    const formattedProtocols = protocols.map((protocol) => ({
      id: protocol.id,
      title: protocol.title,
      description: protocol.description,
      content: protocol.content,
      type: protocol.type,
      category: protocol.category?.name || 'General',
      categoryId: protocol.categoryId,
      businessTypes: protocol.businessTypes,
      jurisdictions: protocol.jurisdictions,
      isVerified: protocol.isVerified,
      usageCount: protocol.usageCount,
      upvotes: protocol.upvotes,
      createdAt: protocol.createdAt,
    }));

    return NextResponse.json({
      protocols: formattedProtocols,
      total: formattedProtocols.length,
    });
  } catch (error) {
    console.error('Error fetching protocols:', error);
    return NextResponse.json(
      { error: 'Error al cargar protocolos' },
      { status: 500 }
    );
  }
}
