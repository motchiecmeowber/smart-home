import { prisma } from "@/config/prisma";
import { UserDetailResponse, UserResponse } from "./identity.dto";

export class IdentityRepository {
  async findUserByEmail(email: string): Promise<any | null> {
    return prisma.user.findUnique({
      where: { email },
      select: {
        userId: true,
        email: true,
        username: true,
        password: true,
        createdAt: true,
        role: true,
      },
    });
  }

  async findUserByUsername(username: string): Promise<any | null> {
    return prisma.user.findUnique({
      where: { username },
      select: {
        userId: true,
        email: true,
        username: true,
        password: true,
        createdAt: true,
        role: true,
      },
    });
  }

  async findUserById(id: string): Promise<any | null> {
    return prisma.user.findUnique({
      where: { userId: id },
      select: {
        userId: true,
        email: true,
        username: true,
        password: true,
        createdAt: true,
        role: true,
      },
    });
  }

  async createCustomer(data: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<UserResponse> {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

    if (!admin) {
      throw new Error("No admin user found. Please create an admin user first.");
    }

    return prisma.user.create({
      data: {
        ...data,
        role: "CUSTOMER",
        customer: {
          create: {
            adminId: admin.userId,
          },
        },
      },
      select: {
        userId: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        role: true,
      },
    });
  }

  async updateUser(
    userId: string,
    data: Partial<{ email: string; username: string; password: string; firstName: string; lastName: string }>
  ): Promise<UserResponse> {
    return prisma.user.update({
      where: { userId },
      data,
      select: {
        userId: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        role: true,
      },
    });
  }

  async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({ where: { userId } });
  }

  async getUsers(): Promise<UserDetailResponse[]> {
    return prisma.user.findMany({
      select: {
        userId: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        role: true
      },
      orderBy: { createdAt: "asc" }
    });
  }

  async getUserById(userId: string): Promise<UserDetailResponse | null> {
    return prisma.user.findUnique({ 
      where: { userId },
      select: {
        userId: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        role: true
      }
    });
  }
}
