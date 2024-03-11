import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { deleteFiles } from "./delete-files";
import { deleteProduct } from "./delete-product";
import { uploadFiles } from "./files";
import { getAllProducts } from "./get-all-products";
import { getAllFilesByProductId } from "./get-files";

export async function uploadsRoutes(app: FastifyInstance) {
  app.post("/uploads", { onRequest: [verifyJwt] }, uploadFiles);
  app.get("/products", { onRequest: [verifyJwt] }, getAllProducts);
  app.delete("/products/:productId", { onRequest: [verifyJwt] }, deleteProduct);
  app.delete("/files", { onRequest: [verifyJwt] }, deleteFiles);
  app.get(
    "/products/:productId/files",
    { onRequest: [verifyJwt] },
    getAllFilesByProductId,
  );
}
