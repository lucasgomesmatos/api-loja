import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { verifyUserRole } from "@/http/middlewares/verify-user-role";
import { FastifyInstance } from "fastify";
import { authenticate } from "./authenticate";
import { forgotPassword } from "./forgotPassword";
import { getAllUsers } from "./get-all-users";
import { profile } from "./profile";
import { refresh } from "./refresh";
import { register } from "./register";
import { updateUser } from "./update";

export async function usersRoutes(app: FastifyInstance) {
  app.post("/sessions", authenticate);
  app.patch("/token/refresh", refresh);
  app.post("forgot-password", forgotPassword);

  /** Authenticated */
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
}
