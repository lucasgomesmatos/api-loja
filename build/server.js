"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_cookie = __toESM(require("@fastify/cookie"));
var import_cors = __toESM(require("@fastify/cors"));
var import_jwt = __toESM(require("@fastify/jwt"));
var import_fastify = __toESM(require("fastify"));
var import_zod18 = require("zod");

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

// src/http/middlewares/verify-jwt.ts
async function verifyJwt(request, reply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    return reply.status(401).send({ message: "Unauthorized" });
  }
}

// src/http/middlewares/verify-user-role.ts
function verifyUserRole(roleToVerify) {
  return async (request, reply) => {
    const { role } = request.user;
    if (role !== roleToVerify) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
  };
}

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: environment.NODE_ENV === "development" ? ["query"] : []
});

// src/repositories/prisma/prisma-categories-repository.ts
var PrismaCategoriesRepository = class {
  async create(name) {
    const category = await prisma.category.create({
      data: {
        name
      }
    });
    return category;
  }
  async findById(id) {
    const category = await prisma.category.findUnique({
      where: {
        id
      }
    });
    return category;
  }
  async findByName(name) {
    const category = await prisma.category.findFirst({
      where: {
        name
      }
    });
    return category;
  }
  async deleteById(id) {
    await prisma.$transaction([
      prisma.productsOnCategories.deleteMany({
        where: {
          categoryId: id
        }
      }),
      prisma.category.delete({
        where: {
          id
        }
      })
    ]);
  }
  async update(categoryId, name) {
    const category = await prisma.category.update({
      where: {
        id: categoryId
      },
      data: {
        name
      }
    });
    return category;
  }
  async findAllCategories(data) {
    const [categories, total] = await prisma.$transaction([
      prisma.category.findMany({
        where: {
          name: {
            contains: data.query
          }
        },
        skip: data.paginate ? (data.page - 1) * 16 : 0,
        take: data.paginate ? 16 : void 0,
        orderBy: {
          createdAt: "desc"
        }
      }),
      prisma.category.count()
    ]);
    return {
      categories,
      total
    };
  }
};

// src/use-cases/erros/category-already-exists-error.ts
var CategoryAlreadyExistsError = class extends Error {
  constructor() {
    super("Category already exists");
  }
};

// src/use-cases/categories-use-case/create-category.ts
var CreateCategoryUseCase = class {
  constructor(categoriesRepository) {
    this.categoriesRepository = categoriesRepository;
  }
  async execute({
    name
  }) {
    const categoryExists = await this.categoriesRepository.findByName(name);
    if (categoryExists) {
      throw new CategoryAlreadyExistsError();
    }
    const category = await this.categoriesRepository.create(name);
    return {
      category
    };
  }
};

// src/use-cases/factories/categories/make-create-category-use-case.ts
function makeCreateCategoryUseCase() {
  const prismaCategoriesRepository = new PrismaCategoriesRepository();
  const createCategoryUseCase = new CreateCategoryUseCase(
    prismaCategoriesRepository
  );
  return createCategoryUseCase;
}

// src/http/controllers/admin/categories/create-category.ts
var import_zod2 = require("zod");
async function createCategory(request, reply) {
  const categoryBodySchema = import_zod2.z.object({
    name: import_zod2.z.coerce.string()
  });
  const { name } = categoryBodySchema.parse(request.body);
  try {
    const createCategoryUseCase = makeCreateCategoryUseCase();
    const { category } = await createCategoryUseCase.execute({
      name
    });
    return reply.send(category);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}

// src/use-cases/categories-use-case/delete-category.ts
var DeleteCategoryUseCase = class {
  constructor(categoriesRepository) {
    this.categoriesRepository = categoriesRepository;
  }
  async execute({ categoryId }) {
    await this.categoriesRepository.deleteById(categoryId);
  }
};

// src/use-cases/factories/categories/make-delete-category-use-case.ts
function makeDeleteCategoryUseCase() {
  const prismaCategoriesRepository = new PrismaCategoriesRepository();
  const deleteCategoryUseCase = new DeleteCategoryUseCase(
    prismaCategoriesRepository
  );
  return deleteCategoryUseCase;
}

// src/http/controllers/admin/categories/delete-category.ts
var import_zod3 = require("zod");
async function deleteCategory(request, reply) {
  const categoryParamsSchema = import_zod3.z.object({
    categoryId: import_zod3.z.string()
  });
  const { categoryId } = categoryParamsSchema.parse(request.params);
  try {
    const deleteCategoryUseCase = makeDeleteCategoryUseCase();
    await deleteCategoryUseCase.execute({
      categoryId
    });
    return reply.send().status(204);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}

// src/use-cases/categories-use-case/get-all-categories.ts
var GetAllCategoriesUseCase = class {
  constructor(categoriesRepository) {
    this.categoriesRepository = categoriesRepository;
  }
  async execute({
    page,
    paginate,
    query
  }) {
    const { categories, total } = await this.categoriesRepository.findAllCategories({
      page,
      paginate,
      query
    });
    return {
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name
      })),
      total
    };
  }
};

// src/use-cases/factories/categories/make-get-all-categories-use-case.ts
function makeGetAllCategoriesUseCase() {
  const prismaCategoriesRepository = new PrismaCategoriesRepository();
  const getAllCategoriesUseCase = new GetAllCategoriesUseCase(
    prismaCategoriesRepository
  );
  return getAllCategoriesUseCase;
}

// src/http/controllers/admin/categories/get-all-categories.ts
var import_zod4 = require("zod");
async function getAllCategories(request, reply) {
  const categoryQuerySchema = import_zod4.z.object({
    page: import_zod4.z.coerce.number().min(1).default(1),
    query: import_zod4.z.string().default(""),
    paginate: import_zod4.z.coerce.boolean().default(false)
  });
  const { page, query, paginate } = categoryQuerySchema.parse(request.query);
  try {
    const getAllCategoriesUseCase = makeGetAllCategoriesUseCase();
    const { categories, total } = await getAllCategoriesUseCase.execute({
      page,
      query,
      paginate
    });
    return reply.send({
      categories,
      total
    });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}

// src/use-cases/erros/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found");
  }
};

// src/use-cases/categories-use-case/update-category.ts
var UpdateCategoryUseCase = class {
  constructor(categoriesRepository) {
    this.categoriesRepository = categoriesRepository;
  }
  async execute({
    categoryId,
    name
  }) {
    const categoryExists = await this.categoriesRepository.findById(categoryId);
    if (!categoryExists) {
      throw new ResourceNotFoundError();
    }
    const category = await this.categoriesRepository.update(categoryId, name);
    return {
      category
    };
  }
};

// src/use-cases/factories/categories/make-update-category-use-case.ts
function makeUpdateCategoryUseCase() {
  const prismaCategoriesRepository = new PrismaCategoriesRepository();
  const updateCategoryUseCase = new UpdateCategoryUseCase(
    prismaCategoriesRepository
  );
  return updateCategoryUseCase;
}

// src/http/controllers/admin/categories/update-category.ts
var import_zod5 = require("zod");
async function updateCategory(request, reply) {
  const categoryParamsSchema = import_zod5.z.object({
    categoryId: import_zod5.z.string()
  });
  const categoryBodySchema = import_zod5.z.object({
    name: import_zod5.z.string()
  });
  const { categoryId } = categoryParamsSchema.parse(request.params);
  const { name } = categoryBodySchema.parse(request.body);
  try {
    const updateCategoryUseCase = makeUpdateCategoryUseCase();
    const { category } = await updateCategoryUseCase.execute({
      categoryId,
      name
    });
    return reply.send(category);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}

// src/http/controllers/admin/categories/routes.ts
async function categoriesRoutes(app2) {
  app2.get(
    "/categories",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    getAllCategories
  );
  app2.post(
    "/categories",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    createCategory
  );
  app2.put(
    "/categories/:categoryId",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    updateCategory
  );
  app2.delete(
    "/categories/:categoryId",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    deleteCategory
  );
}

// src/repositories/prisma/prisma-files-repository.ts
var PrismaFilesRepository = class {
  async create(data) {
    const { name, keyFile, productId } = data;
    const file = await prisma.file.create({
      data: {
        name,
        keyFile,
        productId
      }
    });
    return file;
  }
  async getAllFilesByProductIdPaginate(data) {
    const { productId, page, query } = data;
    const files = await prisma.file.findMany({
      where: {
        productId,
        name: {
          contains: query
        }
      },
      skip: (page - 1) * 12,
      take: 12
    });
    return files;
  }
  async getAllFilesByProductId(productId) {
    const files = await prisma.file.findMany({
      where: {
        productId
      }
    });
    return files;
  }
  async deleteALlFilesByProductId(productId) {
    await prisma.file.deleteMany({
      where: {
        productId
      }
    });
  }
  async deleteAllFiles(ids) {
    await prisma.file.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  }
};

// src/use-cases/delete-files.ts
var DeleteFilesUseCase = class {
  constructor(filesRepository) {
    this.filesRepository = filesRepository;
  }
  async execute({ ids }) {
    await this.filesRepository.deleteAllFiles(ids);
  }
};

// src/use-cases/factories/make-delete-files-use-case.ts
function makeDeleteFilesUseCase() {
  const prismaFilesRepository = new PrismaFilesRepository();
  const deleteFilesUseCase = new DeleteFilesUseCase(prismaFilesRepository);
  return deleteFilesUseCase;
}

// src/http/controllers/admin/products/delete-files.ts
var import_zod6 = require("zod");
async function deleteFiles(request, reply) {
  const filesBodySchema = import_zod6.z.object({
    ids: import_zod6.z.array(import_zod6.z.coerce.number())
  });
  const object = filesBodySchema.parse(request.body);
  try {
    const deleteFilesUseCase = makeDeleteFilesUseCase();
    await deleteFilesUseCase.execute({
      ids: object.ids
    });
    return reply.send().status(204);
  } catch (error) {
    return reply.status(500).send({
      message: "Internal server error"
    });
  }
}

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

// src/lib/aws-s3.ts
var import_client_s3 = require("@aws-sdk/client-s3");
var s3 = new import_client_s3.S3Client({
  region: environment.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: environment.AWS_ACCESS_KEY_ID,
    secretAccessKey: environment.AWS_SECRET_ACCESS_KEY
  }
});

// src/use-cases/delete-product.ts
var import_client_s32 = require("@aws-sdk/client-s3");
var DeleteProductUseCase = class {
  constructor(productsRepository, filesRepository) {
    this.productsRepository = productsRepository;
    this.filesRepository = filesRepository;
  }
  async execute({ productId }) {
    const product = await this.productsRepository.findById(productId);
    if (!product)
      throw new ResourceNotFoundError();
    const files = await this.filesRepository.getAllFilesByProductId(productId);
    const deleteCommands = files.map((file) => {
      const deleteParams = {
        Bucket: environment.AWS_BUCKET_NAME,
        Key: file.keyFile
      };
      return new import_client_s32.DeleteObjectCommand(deleteParams);
    });
    await Promise.all(deleteCommands.map((command) => s3.send(command)));
    await this.filesRepository.deleteALlFilesByProductId(product.id);
    await this.productsRepository.deleteById(product.id);
  }
};

// src/use-cases/factories/make-delete-product-use-case.ts
function makeDeleteProductUseCase() {
  const prismaProductsRepository = new PrismaProductsRepository();
  const prismaFilesRepository = new PrismaFilesRepository();
  const deleteProductUseCase = new DeleteProductUseCase(
    prismaProductsRepository,
    prismaFilesRepository
  );
  return deleteProductUseCase;
}

// src/http/controllers/admin/products/delete-product.ts
var import_zod7 = require("zod");
async function deleteProduct(request, reply) {
  const filesParamsSchema = import_zod7.z.object({
    productId: import_zod7.z.string().uuid()
  });
  const { productId } = filesParamsSchema.parse(request.params);
  try {
    const deleteProductUseCase = makeDeleteProductUseCase();
    await deleteProductUseCase.execute({
      productId
    });
    return reply.send().status(204);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: "Product not found"
      });
    }
    return reply.status(500).send({
      message: "Internal server error"
    });
  }
}

// src/use-cases/create-product.ts
var import_client_s33 = require("@aws-sdk/client-s3");
var import_s3_request_presigner = require("@aws-sdk/s3-request-presigner");
var import_node_crypto = require("crypto");
var CreateProductUseCase = class {
  constructor(productsRepository, filesRepository) {
    this.productsRepository = productsRepository;
    this.filesRepository = filesRepository;
  }
  async execute({
    nameProduct,
    idWoocommerce,
    contentType,
    nameFile,
    categories
  }) {
    const { keyFile, signedUrl } = await this.uploadFile(nameFile, contentType);
    let product = await this.productsRepository.findByName(nameProduct);
    if (product) {
      await this.productsRepository.updateById(product.id, {
        name: nameProduct,
        idWoocommerce,
        categories
      });
    }
    if (!product) {
      product = await this.productsRepository.create({
        name: nameProduct,
        idWoocommerce,
        categories
      });
    }
    await this.filesRepository.create({
      name: nameFile,
      keyFile,
      productId: product.id
    });
    return { signedUrl };
  }
  async uploadFile(nameFile, contentType) {
    const keyFile = (0, import_node_crypto.randomUUID)().concat("-").concat(nameFile);
    const signedUrl = await (0, import_s3_request_presigner.getSignedUrl)(
      s3,
      new import_client_s33.PutObjectCommand({
        Bucket: environment.AWS_BUCKET_NAME,
        Key: keyFile,
        ContentType: contentType
      }),
      {
        expiresIn: 3600
      }
    );
    return { keyFile, signedUrl };
  }
};

// src/use-cases/factories/make-create-product-use-case.ts
function makeCreateProductUseCase() {
  const prismaProductsRepository = new PrismaProductsRepository();
  const prismaFilesRepository = new PrismaFilesRepository();
  const createProductUseCase = new CreateProductUseCase(
    prismaProductsRepository,
    prismaFilesRepository
  );
  return createProductUseCase;
}

// src/http/controllers/admin/products/files.ts
var import_client_s34 = require("@aws-sdk/client-s3");
var import_zod8 = require("zod");
async function uploadFiles(request, reply) {
  const productBodySchema = import_zod8.z.object({
    idWoocommerce: import_zod8.z.coerce.number(),
    nameProduct: import_zod8.z.string(),
    contentType: import_zod8.z.string(),
    nameFile: import_zod8.z.string(),
    categories: import_zod8.z.array(import_zod8.z.string())
  });
  const { nameFile, contentType, idWoocommerce, nameProduct, categories } = productBodySchema.parse(request.body);
  try {
    const createProductUseCase = makeCreateProductUseCase();
    const { signedUrl } = await createProductUseCase.execute({
      idWoocommerce,
      contentType,
      nameFile,
      nameProduct,
      categories
    });
    return reply.status(201).send({ signedUrl });
  } catch (error) {
    if (error instanceof import_client_s34.S3ServiceException) {
      return reply.status(500).send({ message: "Error to upload file" });
    }
    return reply.status(500).send({ message: "Internal server error" });
  }
}

// src/use-cases/get-all-products.ts
var GetAllProductsUseCase = class {
  constructor(productsRepository) {
    this.productsRepository = productsRepository;
  }
  async execute({
    page,
    query,
    categories
  }) {
    const { products, total } = await this.productsRepository.findAllProducts({
      page,
      query,
      categories
    });
    return {
      products,
      total
    };
  }
};

// src/use-cases/factories/make-get-all-products-use-case.ts
function makeGetAllProductsUseCase() {
  const prismaProductsRepository = new PrismaProductsRepository();
  const getAllProductsUseCase = new GetAllProductsUseCase(
    prismaProductsRepository
  );
  return getAllProductsUseCase;
}

// src/http/controllers/admin/products/get-all-products.ts
var import_zod9 = require("zod");
async function getAllProducts(request, reply) {
  const productQuerySchema = import_zod9.z.object({
    page: import_zod9.z.coerce.number().min(1).default(1),
    query: import_zod9.z.string().default(""),
    categories: import_zod9.z.string().optional()
  });
  const { page, query, categories } = productQuerySchema.parse(request.query);
  const categoriesArray = categories?.split(",");
  try {
    const getAllProductsUseCase = makeGetAllProductsUseCase();
    const { products, total } = await getAllProductsUseCase.execute({
      page,
      query,
      categories: categoriesArray
    });
    return reply.send({
      products,
      total
    });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}

// src/use-cases/get-files.ts
var import_client_s35 = require("@aws-sdk/client-s3");
var import_s3_request_presigner2 = require("@aws-sdk/s3-request-presigner");
var GetFilesUseCase = class {
  constructor(filesRepository, productsRepository) {
    this.filesRepository = filesRepository;
    this.productsRepository = productsRepository;
  }
  async execute({
    productId
  }) {
    const files = await this.filesRepository.getAllFilesByProductId(productId);
    const categories = await this.productsRepository.getCategoryByProductId(productId);
    const content = [];
    for (const file of files) {
      const signedUrl = await (0, import_s3_request_presigner2.getSignedUrl)(
        s3,
        new import_client_s35.GetObjectCommand({
          Bucket: environment.AWS_BUCKET_NAME,
          Key: file.keyFile
        })
      );
      content.push({
        id: file.id,
        name: file.name,
        url: signedUrl,
        keyFile: file.keyFile,
        productId: file.productId
      });
    }
    return {
      files: content,
      categories
    };
  }
};

// src/use-cases/factories/make-get-files-use-case.ts
function makeGetFilesUseCase() {
  const prismaFilesRepository = new PrismaFilesRepository();
  const productsRepository = new PrismaProductsRepository();
  const getFilesUseCase = new GetFilesUseCase(
    prismaFilesRepository,
    productsRepository
  );
  return getFilesUseCase;
}

// src/http/controllers/admin/products/get-files.ts
var import_zod10 = require("zod");
async function getAllFilesByProductId(request, reply) {
  const filesParamsSchema = import_zod10.z.object({
    productId: import_zod10.z.string().uuid()
  });
  const { productId } = filesParamsSchema.parse(request.params);
  try {
    const getAllFilesUseCase = makeGetFilesUseCase();
    const { files, categories } = await getAllFilesUseCase.execute({
      productId
    });
    return reply.send({
      files,
      categories
    });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}

// src/http/controllers/admin/products/routes.ts
async function productsRoutes(app2) {
  app2.post(
    "/uploads",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    uploadFiles
  );
  app2.get(
    "/products",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    getAllProducts
  );
  app2.delete(
    "/products/:productId",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    deleteProduct
  );
  app2.delete(
    "/files",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    deleteFiles
  );
  app2.get(
    "/products/:productId/files",
    { onRequest: [verifyJwt] },
    getAllFilesByProductId
  );
}

// src/use-cases/erros/invalid-credentials-error.ts
var InvalidCredentialsError = class extends Error {
  constructor() {
    super("Invalid credentials");
  }
};

// src/repositories/prisma/prisma-users-repository.ts
var PrismaUsersRepository = class {
  async findById(id) {
    const user = await prisma.user.findUnique({
      where: {
        id
      }
    });
    return user;
  }
  async findByEmail(email) {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });
    return user;
  }
  async create({
    name,
    email,
    password_hash,
    cpf,
    phone
  }) {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        cpf,
        phone
      }
    });
    return user;
  }
  async findAllUsers(data) {
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          OR: [
            {
              name: {
                contains: data.query
              }
            },
            {
              email: {
                contains: data.query
              }
            }
          ]
        },
        take: data.page ? 16 : void 0,
        skip: data.page ? (data.page - 1) * 16 : 0
      }),
      prisma.user.count()
    ]);
    return {
      users,
      total
    };
  }
  async update(id, { name, email, phone, cpf }) {
    await prisma.user.update({
      where: {
        id
      },
      data: {
        name,
        email,
        phone,
        cpf
      }
    });
  }
};

// src/use-cases/users-use-case/authenticate.ts
var import_bcryptjs = require("bcryptjs");
var AuthenticateUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  async execute({
    email,
    password
  }) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }
    const doesPasswordMatches = await (0, import_bcryptjs.compare)(password, user.password_hash);
    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError();
    }
    return {
      user
    };
  }
};

// src/use-cases/factories/make-authenticate-use-case.ts
function makeAuthenticateUseCase() {
  const prismaUsersRepository = new PrismaUsersRepository();
  const authenticateUseCase = new AuthenticateUseCase(prismaUsersRepository);
  return authenticateUseCase;
}

// src/http/controllers/admin/users/authenticate.ts
var import_zod11 = require("zod");
async function authenticate(request, reply) {
  const authenticateBodySchema = import_zod11.z.object({
    email: import_zod11.z.string().email(),
    password: import_zod11.z.string().min(6)
  });
  const { email, password } = authenticateBodySchema.parse(request.body);
  try {
    const authenticateUseCase = makeAuthenticateUseCase();
    const { user } = await authenticateUseCase.execute({
      email,
      password
    });
    const token = await reply.jwtSign(
      {
        role: user.role
      },
      {
        sign: {
          sub: user.id
        }
      }
    );
    const refreshToken = await reply.jwtSign(
      {
        role: user.role
      },
      {
        sign: {
          sub: user.id,
          expiresIn: "7d"
        }
      }
    );
    return reply.setCookie("refreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: true
    }).status(200).send({
      refreshToken,
      token
    });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(401).send({
        message: error.message
      });
    }
    throw error;
  }
}

// src/use-cases/users-use-case/get-all-users.ts
var GetAllUsersUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  async execute({
    page,
    query
  }) {
    const { users, total } = await this.usersRepository.findAllUsers({
      page,
      query
    });
    const usersPartial = users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone
      };
    });
    return {
      users: usersPartial,
      total
    };
  }
};

// src/use-cases/factories/make-get-all-users-use-case.ts
function makeGetAllUsersUseCase() {
  const prismaUsersRepository = new PrismaUsersRepository();
  const getUserProfileUseCase = new GetAllUsersUseCase(prismaUsersRepository);
  return getUserProfileUseCase;
}

// src/http/controllers/admin/users/get-all-users.ts
var import_zod12 = require("zod");
async function getAllUsers(request, reply) {
  const UsersParamsSchema = import_zod12.z.object({
    page: import_zod12.z.coerce.number().min(1).default(1),
    query: import_zod12.z.string().default("")
  });
  const { query, page } = UsersParamsSchema.parse(request.query);
  const getAllUsers2 = makeGetAllUsersUseCase();
  const { users, total } = await getAllUsers2.execute({
    page,
    query
  });
  return reply.status(200).send({ users, total });
}

// src/use-cases/users-use-case/get-user-profile.ts
var GetUserProfileUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  async execute({
    userId
  }) {
    const user = await this.usersRepository.findById(userId);
    if (!user)
      throw new ResourceNotFoundError();
    const userPartial = {
      ...user,
      password_hash: void 0
    };
    return {
      user: userPartial
    };
  }
};

// src/use-cases/factories/make-get-user-profile-use-case.ts
function makeGetUserProfileUseCase() {
  const prismaUsersRepository = new PrismaUsersRepository();
  const getUserProfileUseCase = new GetUserProfileUseCase(
    prismaUsersRepository
  );
  return getUserProfileUseCase;
}

// src/http/controllers/admin/users/profile.ts
async function profile(request, reply) {
  const getUserProfile = makeGetUserProfileUseCase();
  const { user } = await getUserProfile.execute({
    userId: request.user.sub
  });
  return reply.status(200).send({ ...user, password: void 0 });
}

// src/http/controllers/admin/users/refresh.ts
async function refresh(request, reply) {
  await request.jwtVerify({
    onlyCookie: true
  });
  const { role } = request.user;
  const token = await reply.jwtSign(
    { role },
    {
      sign: {
        sub: request.user.sub
      }
    }
  );
  const refreshToken = await reply.jwtSign(
    { role },
    {
      sign: {
        sub: request.user.sub,
        expiresIn: "7d"
      }
    }
  );
  return reply.setCookie("refreshToken", refreshToken, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: true
  }).status(200).send({
    token
  });
}

// src/use-cases/erros/user-already-exists-error.ts
var UserAlreadyExistsError = class extends Error {
  constructor() {
    super("E-mail already exists");
  }
};

// src/use-cases/users-use-case/register-user.ts
var import_bcryptjs2 = require("bcryptjs");
var RegisterUserUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  async execute({
    name,
    email,
    cpf,
    phone
  }) {
    const userWithEmailAlreadyExists = await this.usersRepository.findByEmail(email);
    if (userWithEmailAlreadyExists)
      throw new UserAlreadyExistsError();
    const passwordHash = await (0, import_bcryptjs2.hash)(cpf, 6);
    const user = await this.usersRepository.create({
      name,
      email,
      password_hash: passwordHash,
      cpf,
      phone
    });
    return {
      user
    };
  }
};

// src/use-cases/factories/make-register-user-use-case.ts
function makeRegisterUseCase() {
  const prismaUsersRepository = new PrismaUsersRepository();
  const registerUserUseCase = new RegisterUserUseCase(prismaUsersRepository);
  return registerUserUseCase;
}

// src/http/controllers/admin/users/register.ts
var import_zod13 = require("zod");
async function register(request, reply) {
  const registerUserBodySchema = import_zod13.z.object({
    name: import_zod13.z.string(),
    email: import_zod13.z.string().email(),
    cpf: import_zod13.z.string().length(14),
    phone: import_zod13.z.string().length(15)
  });
  const { name, email, cpf, phone } = registerUserBodySchema.parse(
    request.body
  );
  try {
    const registerUserUseCase = makeRegisterUseCase();
    await registerUserUseCase.execute({
      name,
      email,
      cpf,
      phone
    });
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(422).send({
        message: error.message
      });
    }
    throw error;
  }
  return reply.status(201).send();
}

// src/use-cases/users-use-case/update-user.ts
var UpdateUserUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  async execute({
    userId,
    email,
    name,
    phone,
    cpf
  }) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new ResourceNotFoundError();
    }
    await this.usersRepository.update(userId, {
      email,
      name,
      phone,
      cpf
    });
  }
};

// src/use-cases/factories/make-update-user-use-case.ts
function makeUpdateUserUseCase() {
  const prismaUsersRepository = new PrismaUsersRepository();
  const getUserProfileUseCase = new UpdateUserUseCase(prismaUsersRepository);
  return getUserProfileUseCase;
}

// src/http/controllers/admin/users/update.ts
var import_zod14 = require("zod");
async function updateUser(request, reply) {
  const updateUserBodySchema = import_zod14.z.object({
    name: import_zod14.z.string(),
    email: import_zod14.z.string().email(),
    cpf: import_zod14.z.string().length(14),
    phone: import_zod14.z.string().length(15)
  });
  const updateUserParamsSchema = import_zod14.z.object({
    userId: import_zod14.z.string().uuid()
  });
  const { name, email, cpf, phone } = updateUserBodySchema.parse(request.body);
  const { userId } = updateUserParamsSchema.parse(request.params);
  try {
    const updateUserUseCase = makeUpdateUserUseCase();
    await updateUserUseCase.execute({
      userId,
      name,
      email,
      cpf,
      phone
    });
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(422).send({
        message: error.message
      });
    }
    throw error;
  }
  return reply.status(201).send();
}

// src/http/controllers/admin/users/routes.ts
async function usersRoutes(app2) {
  app2.post("/sessions", authenticate);
  app2.patch("/token/refresh", refresh);
  app2.get("/me", { onRequest: [verifyJwt] }, profile);
  app2.get(
    "/users",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    getAllUsers
  );
  app2.post(
    "/users",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    register
  );
  app2.put(
    "/users/:userId",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    updateUser
  );
}

// src/use-cases/users-use-case/authenticate-user-store.ts
var AuthenticateUserStoreUseCase = class {
  constructor(usersStoreRepository) {
    this.usersStoreRepository = usersStoreRepository;
  }
  async execute({
    email
  }) {
    const user = await this.usersStoreRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }
    return {
      user
    };
  }
};

// src/use-cases/factories/make-authenticate-user-store-use-case.ts
function makeAuthenticateUserStoreUseCase() {
  const prismaUsersStoreRepository = new PrismaUsersRepository();
  const authenticateUserStoreUseCase = new AuthenticateUserStoreUseCase(
    prismaUsersStoreRepository
  );
  return authenticateUserStoreUseCase;
}

// src/http/controllers/store/authenticate.ts
var import_zod15 = require("zod");
async function authenticateUserStore(request, reply) {
  const authenticateBodySchema = import_zod15.z.object({
    email: import_zod15.z.string().email()
  });
  const { email } = authenticateBodySchema.parse(request.body);
  try {
    const authenticateUseCase = makeAuthenticateUserStoreUseCase();
    const { user } = await authenticateUseCase.execute({
      email
    });
    const token = await reply.jwtSign(
      {
        role: user.role
      },
      {
        sign: {
          sub: user.id
        }
      }
    );
    const refreshToken = await reply.jwtSign(
      {
        role: user.role
      },
      {
        sign: {
          sub: user.id,
          expiresIn: "7d"
        }
      }
    );
    return reply.setCookie("refreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: true
    }).status(200).send({
      refreshToken,
      token
    });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(401).send({
        message: error.message
      });
    }
    throw error;
  }
}

// src/repositories/prisma/prisma-orders-repository.ts
var PrismaOrdersRepository = class {
  async create(data) {
    const { id, status, userId, productsIds, json } = data;
    await prisma.order.create({
      data: {
        id,
        status,
        userId,
        productsIds,
        json
      }
    });
  }
  async findByUserId(userId) {
    const orders = await prisma.order.findMany({
      where: {
        userId
      }
    });
    return orders;
  }
};

// src/use-cases/products-use-case/get-all-products-by-user.ts
var GetAllProductsByUserUseCase = class {
  constructor(productsRepository, ordersRepository) {
    this.productsRepository = productsRepository;
    this.ordersRepository = ordersRepository;
  }
  async execute({
    page,
    query,
    userId
  }) {
    const orders = await this.ordersRepository.findByUserId(userId);
    const productsOrders = orders.map((order) => order.productsIds);
    const productsIds = String(productsOrders).split(",");
    const productsIdsArray = productsIds.map((id) => Number(id));
    const { products, total } = await this.productsRepository.getAllProductsByIdWoocommerce(
      page,
      query,
      productsIdsArray
    );
    return {
      products,
      total
    };
  }
};

// src/use-cases/factories/make-get-all-products-by-user-use-case.ts
function makeGetAllProductsByUserUseCase() {
  const prismaProductsRepository = new PrismaProductsRepository();
  const prismaOrdersRepository = new PrismaOrdersRepository();
  const getAllProductsByUserUseCase = new GetAllProductsByUserUseCase(
    prismaProductsRepository,
    prismaOrdersRepository
  );
  return getAllProductsByUserUseCase;
}

// src/http/controllers/store/get-all-products-by-user.ts
var import_zod16 = require("zod");
async function getAllProductsByUser(request, reply) {
  const productQuerySchema = import_zod16.z.object({
    page: import_zod16.z.coerce.number().min(1).default(1),
    query: import_zod16.z.string().default("")
  });
  const { page, query } = productQuerySchema.parse(request.query);
  try {
    const getAllProductsByUserUseCase = makeGetAllProductsByUserUseCase();
    const { products, total } = await getAllProductsByUserUseCase.execute({
      page,
      query,
      userId: request.user.sub
    });
    return reply.send({
      products,
      total
    });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}

// src/http/controllers/store/refresh.ts
async function refreshTokenStore(request, reply) {
  await request.jwtVerify({
    onlyCookie: true
  });
  const { role } = request.user;
  const token = await reply.jwtSign(
    { role },
    {
      sign: {
        sub: request.user.sub
      }
    }
  );
  const refreshToken = await reply.jwtSign(
    { role },
    {
      sign: {
        sub: request.user.sub,
        expiresIn: "7d"
      }
    }
  );
  return reply.setCookie("refreshToken", refreshToken, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: true
  }).status(200).send({
    token
  });
}

// src/use-cases/users-use-case/register-user-store.ts
var import_bcryptjs3 = require("bcryptjs");
var RegisterUserStoreUseCase = class {
  constructor(usersRepository, ordersRepository) {
    this.usersRepository = usersRepository;
    this.ordersRepository = ordersRepository;
  }
  async execute({
    id,
    status,
    billing,
    lineItems
  }) {
    const userEmailExists = await this.usersRepository.findByEmail(
      billing.email
    );
    if (userEmailExists) {
      this.createOrder({ id, status, lineItems }, userEmailExists.id);
      return;
    }
    const passwordHash = await (0, import_bcryptjs3.hash)(billing.cpf, 6);
    const user = await this.usersRepository.create({
      name: billing.firstName.concat(" ", billing.lastName),
      email: billing.email,
      password_hash: passwordHash,
      phone: billing.phone,
      cpf: billing.cpf
    });
    this.createOrder({ id, status, lineItems }, user.id);
  }
  async createOrder(data, userId) {
    const { id, status, lineItems } = data;
    const productsIds = lineItems.map((item) => item.productId).join(",");
    this.ordersRepository.create({
      id,
      status,
      userId,
      productsIds,
      json: JSON.stringify({
        data,
        userId
      })
    });
  }
};

// src/use-cases/factories/make-register-user-store-use-case.ts
function makeRegisterUserStoreUseCase() {
  const prismaUsersStoreRepository = new PrismaUsersRepository();
  const prismaOrdersRepository = new PrismaOrdersRepository();
  const registerUserUseCase = new RegisterUserStoreUseCase(
    prismaUsersStoreRepository,
    prismaOrdersRepository
  );
  return registerUserUseCase;
}

// src/http/controllers/store/register.ts
var import_zod17 = require("zod");
async function registerUserStore(request, reply) {
  const registerUserStoreBodySchema = import_zod17.z.object({
    id: import_zod17.z.number(),
    status: import_zod17.z.enum(["pending", "completed", "canceled"]),
    billing: import_zod17.z.object({
      first_name: import_zod17.z.string(),
      last_name: import_zod17.z.string(),
      email: import_zod17.z.string().email(),
      phone: import_zod17.z.string().optional(),
      cpf: import_zod17.z.string().optional()
    }),
    line_items: import_zod17.z.array(
      import_zod17.z.object({
        id: import_zod17.z.number(),
        product_id: import_zod17.z.number(),
        name: import_zod17.z.string(),
        price: import_zod17.z.number()
      })
    )
  });
  const { id, status, billing, line_items } = registerUserStoreBodySchema.parse(
    request.body
  );
  const billingParams = {
    firstName: billing.first_name,
    lastName: billing.last_name,
    email: billing.email,
    phone: billing.phone,
    cpf: billing.cpf
  };
  const lineItemsParams = line_items.map((lineItem) => {
    return {
      id: lineItem.id,
      name: lineItem.name,
      productId: lineItem.product_id,
      price: lineItem.price
    };
  });
  try {
    const registerUserStoreUseCase = makeRegisterUserStoreUseCase();
    registerUserStoreUseCase.execute({
      id,
      status,
      billing: billingParams,
      lineItems: lineItemsParams
    });
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(422).send({
        message: error.message
      });
    }
    throw error;
  }
  return reply.status(201).send();
}

// src/http/controllers/store/routes.ts
async function usersStoreRoutes(app2) {
  app2.post("/store/users", registerUserStore);
  app2.post("/store/sessions", authenticateUserStore);
  app2.post("/store/token/refresh", refreshTokenStore);
  app2.get("/store/products", { onRequest: [verifyJwt] }, getAllProductsByUser);
}

// src/app.ts
var app = (0, import_fastify.default)();
app.register(import_jwt.default, {
  secret: environment.JWT_SECRET,
  cookie: {
    cookieName: "refreshToken",
    signed: false
  },
  sign: {
    expiresIn: "10m"
  }
});
app.register(import_cors.default, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"]
});
app.register(import_cookie.default);
app.register(usersRoutes);
app.register(usersStoreRoutes);
app.register(productsRoutes);
app.register(categoriesRoutes);
app.setErrorHandler((error, _, reply) => {
  if (error instanceof import_zod18.ZodError) {
    reply.status(400).send({
      message: "Validation error",
      issues: error.format()
    });
  }
  if (environment.NODE_ENV !== "production") {
    console.error(error);
  } else {
  }
  console.error(error);
  reply.status(500).send({
    message: "Internal server error"
  });
});

// src/server.ts
app.listen({
  host: "0.0.0.0",
  port: environment.PORT
}).then((address) => {
  console.log(`\u{1F525} HTTP Server Running! ${address}`);
});
