import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { uploadFiles } from "./files";

export async function uploadsRoutes(app: FastifyInstance) {
  app.post("/uploads", { onRequest: [verifyJwt] }, uploadFiles);
}
