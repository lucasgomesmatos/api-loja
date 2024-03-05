import { FastifyInstance } from "fastify";
import { registerUserStore } from "./register";

export async function usersStoreRoutes(app: FastifyInstance) {
  app.post("/store/users", registerUserStore);
}
