import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getCurrentUserRole() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUser.id },
    select: { role: true },
  });

  return user?.role || "CLIENT";
}

export async function isAdmin() {
  const role = await getCurrentUserRole();
  return role === "ADMIN";
}

export async function isClient() {
  const role = await getCurrentUserRole();
  return role === "CLIENT";
}