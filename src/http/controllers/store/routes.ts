import { FastifyInstance } from "fastify";
import { authenticateUserStore } from "./authenticate";
import { refreshTokenStore } from "./refresh";
import { registerUserStore } from "./register";

export async function usersStoreRoutes(app: FastifyInstance) {
  app.post("/store/users", registerUserStore);
  app.post("/store/sessions", authenticateUserStore);

  app.post("/store/token/refresh", refreshTokenStore);
}
