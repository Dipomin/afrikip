import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined
};

// use `prisma` in your application to read and write data in your DB

const prismadb = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV != "production") globalThis.prisma = prismadb;

export default prismadb;