"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/repositories/prisma/prisma-products-repository.ts
var prisma_products_repository_exports = {};
__export(prisma_products_repository_exports, {
  PrismaProductsRepository: () => PrismaProductsRepository
});
module.exports = __toCommonJS(prisma_products_repository_exports);

// src/env/env.ts
var import_dotenv = require("dotenv");
var import_zod = require("zod");
if (process.env.NODE_ENV === "test") {
  (0, import_dotenv.config)({ path: ".env.test", override: true });
} else {
  (0, import_dotenv.config)();
}
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("development"),
  PORT: import_zod.z.coerce.number().default(3333),
  JWT_SECRET: import_zod.z.string(),
  AWS_BASE_URL: import_zod.z.string(),
  AWS_BUCKET_NAME: import_zod.z.string(),
  AWS_DEFAULT_REGION: import_zod.z.string(),
  AWS_SECRET_ACCESS_KEY: import_zod.z.string(),
  AWS_ACCESS_KEY_ID: import_zod.z.string()
});
var env = envSchema.safeParse(process.env);
if (!env.success) {
  console.error("Invalid environment variables", env.error.format());
  throw new Error("Invalid environment variables.");
}
var environment = env.data;

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: environment.NODE_ENV === "development" ? ["query"] : []
});

// src/repositories/prisma/prisma-products-repository.ts
var PrismaProductsRepository = class {
  async findAllProducts({ query, page, categories }) {
    if (!categories) {
      const [products2, total2] = await prisma.$transaction([
        prisma.product.findMany({
          where: {
            name: {
              contains: query
            }
          },
          skip: (page - 1) * 16,
          take: 16
        }),
        prisma.product.count()
      ]);
      return {
        products: products2,
        total: total2
      };
    }
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: {
          name: {
            contains: query
          },
          products: {
            some: {
              categoryId: {
                in: categories
              }
            }
          }
        },
        skip: (page - 1) * 16,
        take: 16
      }),
      prisma.product.count()
    ]);
    return {
      products,
      total
    };
  }
  async create(data) {
    const product = await prisma.product.create({
      data: {
        idWoocommerce: data.idWoocommerce,
        name: data.name
      }
    });
    await prisma.productsOnCategories.createMany({
      data: data.categories.map((categoryId) => ({
        productId: product.id,
        categoryId
      }))
    });
    return product;
  }
  async findByName(name) {
    const product = await prisma.product.findUnique({
      where: {
        name
      }
    });
    return product;
  }
  async findById(id) {
    const product = await prisma.product.findUnique({
      where: {
        id
      }
    });
    return product;
  }
  async deleteById(id) {
    await prisma.$transaction([
      prisma.productsOnCategories.deleteMany({
        where: {
          productId: id
        }
      }),
      prisma.product.delete({
        where: {
          id
        }
      })
    ]);
  }
  async getCategoryByProductId(productId) {
    const categoriesAll = await prisma.productsOnCategories.findMany({
      where: {
        productId
      },
      select: {
        category: true
      }
    });
    const categories = categoriesAll.map((item) => item.category);
    return categories;
  }
  async updateById(id, data) {
    const product = await prisma.product.update({
      where: {
        id
      },
      data: {
        idWoocommerce: data.idWoocommerce,
        name: data.name
      }
    });
    await prisma.productsOnCategories.deleteMany({
      where: {
        productId: product.id
      }
    });
    await prisma.productsOnCategories.createMany({
      data: data.categories.map((categoryId) => ({
        productId: product.id,
        categoryId
      }))
    });
    return product;
  }
  async getAllProductsById(productsIds) {
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productsIds
        }
      }
    });
    return products;
  }
  async getAllProductsByIdWoocommerce(page, query, productsIds) {
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: {
          idWoocommerce: {
            in: productsIds
          },
          name: {
            contains: query
          }
        },
        skip: (page - 1) * 16,
        take: 16
      }),
      prisma.product.count()
    ]);
    return {
      products,
      total
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PrismaProductsRepository
});
