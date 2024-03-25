import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { authenticateUserStore } from "./authenticate";
import { getAllProductsByUser } from "./get-all-products-by-user";
import { refreshTokenStore } from "./refresh";
import { registerUserStore } from "./register";

export async function usersStoreRoutes(app: FastifyInstance) {
  app.post("/store/webhook", registerUserStore);

  app.post("/store/sessions", authenticateUserStore);
  app.post("/store/token/refresh", refreshTokenStore);
  app.get("/store/products", { onRequest: [verifyJwt] }, getAllProductsByUser);
}
