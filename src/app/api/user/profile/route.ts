import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        professionalProfile: true,
        businessProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Don't send password hash to client
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { name, currentPassword, newPassword, professionalProfile, businessProfile } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
      }

      if (user.password) {
        const bcrypt = require('bcryptjs');
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
          return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        }
      }
    }

    // Update user data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (newPassword) updateData.password = await hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      include: {
        professionalProfile: true,
        businessProfile: true,
      },
    });

    // Update professional profile if provided
    if (professionalProfile && user.profileType === 'PROFESSIONAL') {
      await prisma.professionalProfile.update({
        where: { userId: user.id },
        data: professionalProfile,
      });
    }

    // Update business profile if provided
    if (businessProfile && user.profileType === 'BUSINESS') {
      await prisma.businessProfile.update({
        where: { userId: user.id },
        data: businessProfile,
      });
    }

    // Fetch updated user with profiles
    const finalUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        professionalProfile: true,
        businessProfile: true,
      },
    });

    // Don't send password hash to client
    const { password: _, ...userWithoutPassword } = finalUser!;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
