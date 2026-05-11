import { prisma } from "@/config/prisma";
import { UserResponse } from "./identity.dto";

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

  async createUser(data: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<UserResponse> {
    return prisma.user.create({
      data: {
        ...data,
        customer: {
          create: {} // Tự động tạo bản ghi trong bảng CUSTOMER
        }
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
}
