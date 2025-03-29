import { PrismaClient } from "@prisma/client";
import { mockDeep } from "vitest-mock-extended";

const prismaClient = mockDeep<PrismaClient>();

export {prismaClient};