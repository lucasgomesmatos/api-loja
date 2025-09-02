import { FastifyInstance } from "fastify";

import { authenticate } from "./authenticate";
import { forgotPassword } from "./forgot-password";
import { getAllUsers } from "./get-all-users";
import { profile } from "./profile";
import { refresh } from "./refresh";
import { register } from "./register";
import { resetPassword } from "./reset-password";
import { updateUser } from "./update";

import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { verifyUserRole } from "@/http/middlewares/verify-user-role";

export async function usersRoutes(app: FastifyInstance) {
  app.post("/sessions", authenticate);
  app.patch("/token/refresh", refresh);
  app.post("/forgot-password", forgotPassword);
  app.get("/me", { onRequest: [verifyJwt] }, profile);
  app.get(
    "/users",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    getAllUsers,
  );

  app.post(
    "/users",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    register,
  );
  app.put(
    "/users/:userId",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    updateUser,
  );

  app.post(
    "/reset-password",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    resetPassword,
  );
}
