import { PrismaClient } from "@prisma/client";

import { environment } from "@/env/env";

export const prisma = new PrismaClient({
  log: environment.NODE_ENV === "development" ? ["query"] : [],
});
