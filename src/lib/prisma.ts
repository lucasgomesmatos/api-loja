import { environment } from "@/env/env";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: environment.NODE_ENV === "development" ? ["query"] : [],
});
