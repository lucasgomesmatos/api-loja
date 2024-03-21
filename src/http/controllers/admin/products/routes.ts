import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { verifyUserRole } from "@/http/middlewares/verify-user-role";
import { FastifyInstance } from "fastify";
import { deleteFiles } from "./delete-files";
import { deleteProduct } from "./delete-product";
import { uploadFiles } from "./files";
import { getAllProducts } from "./get-all-products";
import { getAllFilesByProductId } from "./get-files";

export async function productsRoutes(app: FastifyInstance) {
  app.post(
    "/uploads",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    uploadFiles,
  );
  app.get(
    "/products",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    getAllProducts,
  );
  app.delete(
    "/products/:productId",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    deleteProduct,
  );
  app.delete(
    "/files",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    deleteFiles,
  );
  app.get(
    "/products/:productId/files",
    { onRequest: [verifyJwt] },
    getAllFilesByProductId,
  );
}
