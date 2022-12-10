import { User } from "@prisma/client";
import { prisma } from "~/db.server";

export async function createUser(address: User["address"]) {
  return prisma.user.create({
    data: {
      address,
    },
  });
}

export async function getUserByAddress(address: User["address"]) {
  return prisma.user.findUnique({ where: { address } })
}
