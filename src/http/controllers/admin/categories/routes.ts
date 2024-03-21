import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { verifyUserRole } from "@/http/middlewares/verify-user-role";
import { FastifyInstance } from "fastify";
import { createCategory } from "./create-category";
import { deleteCategory } from "./delete-category";
import { getAllCategories } from "./get-all-categories";
import { updateCategory } from "./update-category";

export async function categoriesRoutes(app: FastifyInstance) {
  app.get(
    "/categories",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    getAllCategories,
  );
  app.post(
    "/categories",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    createCategory,
  );
  app.put(
    "/categories/:categoryId",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    updateCategory,
  );
  app.delete(
    "/categories/:categoryId",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    deleteCategory,
  );
}
