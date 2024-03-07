import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { uploadFiles } from "./files";
import { getAllProducts } from "./get-all-products";
import { getAllFilesByProductId } from "./get-files";

export async function uploadsRoutes(app: FastifyInstance) {
  app.post("/uploads", { onRequest: [verifyJwt] }, uploadFiles);
  app.get("/products", { onRequest: [verifyJwt] }, getAllProducts);
  app.get(
    "/files/:productId",
    { onRequest: [verifyJwt] },
    getAllFilesByProductId,
  );
}
