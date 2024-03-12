import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { createCategory } from "./create-category";
import { getAllCategories } from "./get-all-categories";
import { updateCategory } from "./update-category";

export async function categoriesRoutes(app: FastifyInstance) {
  app.get("/categories", { onRequest: [verifyJwt] }, getAllCategories);
  app.post("/categories", { onRequest: [verifyJwt] }, createCategory);
  app.put(
    "/categories/:categoryId",
    { onRequest: [verifyJwt] },
    updateCategory,
  );
}
