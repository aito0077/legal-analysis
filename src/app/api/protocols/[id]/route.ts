import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userProtocol = await prisma.userProtocol.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        protocol: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!userProtocol) {
      return NextResponse.json({ error: 'Protocolo no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      id: userProtocol.id,
      protocolId: userProtocol.protocolId,
      title: userProtocol.protocol.title,
      description: userProtocol.protocol.description,
      content: userProtocol.protocol.content,
      category: userProtocol.protocol.category?.name || 'General',
      status: userProtocol.status,
      progress: userProtocol.progress,
      assignedAt: userProtocol.assignedAt,
      startedAt: userProtocol.startedAt,
      completedAt: userProtocol.completedAt,
      notes: userProtocol.notes,
      customizations: userProtocol.customizations,
      type: userProtocol.protocol.type,
    });
  } catch (error) {
    console.error('Error fetching protocol:', error);
    return NextResponse.json(
      { error: 'Error al cargar protocolo' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();
    const { status, progress, notes, customizations } = data;

    // Verify ownership
    const userProtocol = await prisma.userProtocol.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!userProtocol) {
      return NextResponse.json({ error: 'Protocolo no encontrado' }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};

    if (status !== undefined) {
      updateData.status = status;

      // Auto-set timestamps
      if (status === 'IN_PROGRESS' && !userProtocol.startedAt) {
        updateData.startedAt = new Date();
      }
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
        updateData.progress = 100;
      }
    }

    if (progress !== undefined) {
      updateData.progress = Math.min(100, Math.max(0, progress));

      // Auto-complete if progress reaches 100
      if (progress >= 100 && userProtocol.status !== 'COMPLETED') {
        updateData.status = 'COMPLETED';
        updateData.completedAt = new Date();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (customizations !== undefined) {
      updateData.customizations = customizations;
    }

    const updated = await prisma.userProtocol.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      protocol: updated,
    });
  } catch (error) {
    console.error('Error updating protocol:', error);
    return NextResponse.json(
      { error: 'Error al actualizar protocolo' },
      { status: 500 }
    );
  }
}
