import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { deleteProduct } from "./delete-product";
import { uploadFiles } from "./files";
import { getAllProducts } from "./get-all-products";
import { getAllFilesByProductId } from "./get-files";

export async function uploadsRoutes(app: FastifyInstance) {
  app.post("/uploads", { onRequest: [verifyJwt] }, uploadFiles);
  app.get("/products", { onRequest: [verifyJwt] }, getAllProducts);
  app.delete("/products/:productId", { onRequest: [verifyJwt] }, deleteProduct);
  app.get(
    "/files/:productId",
    { onRequest: [verifyJwt] },
    getAllFilesByProductId,
  );
}
