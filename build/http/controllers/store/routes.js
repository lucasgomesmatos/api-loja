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

// src/http/controllers/store/routes.ts
var routes_exports = {};
__export(routes_exports, {
  usersStoreRoutes: () => usersStoreRoutes
});
module.exports = __toCommonJS(routes_exports);

// src/http/middlewares/verify-jwt.ts
async function verifyJwt(request, reply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    return reply.status(401).send({ message: "Unauthorized" });
  }
}

// src/use-cases/erros/invalid-credentials-error.ts
var InvalidCredentialsError = class extends Error {
  constructor() {
    super("Invalid credentials");
  }
};

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
var import_zod2 = require("zod");
async function authenticateUserStore(request, reply) {
  const authenticateBodySchema = import_zod2.z.object({
    email: import_zod2.z.string().email()
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
var import_zod3 = require("zod");
async function getAllProductsByUser(request, reply) {
  const productQuerySchema = import_zod3.z.object({
    page: import_zod3.z.coerce.number().min(1).default(1),
    query: import_zod3.z.string().default("")
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

// src/use-cases/erros/user-already-exists-error.ts
var UserAlreadyExistsError = class extends Error {
  constructor() {
    super("E-mail already exists");
  }
};

// src/use-cases/users-use-case/register-user-store.ts
var import_bcryptjs = require("bcryptjs");
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
    const passwordHash = await (0, import_bcryptjs.hash)(billing.cpf, 6);
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
var import_zod4 = require("zod");
async function registerUserStore(request, reply) {
  const registerUserStoreBodySchema = import_zod4.z.object({
    id: import_zod4.z.number(),
    status: import_zod4.z.enum(["pending", "completed", "canceled"]),
    billing: import_zod4.z.object({
      first_name: import_zod4.z.string(),
      last_name: import_zod4.z.string(),
      email: import_zod4.z.string().email(),
      phone: import_zod4.z.string().optional(),
      cpf: import_zod4.z.string().optional()
    }),
    line_items: import_zod4.z.array(
      import_zod4.z.object({
        id: import_zod4.z.number(),
        product_id: import_zod4.z.number(),
        name: import_zod4.z.string(),
        price: import_zod4.z.number()
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
async function usersStoreRoutes(app) {
  app.post("/store/users", registerUserStore);
  app.post("/store/sessions", authenticateUserStore);
  app.post("/store/token/refresh", refreshTokenStore);
  app.get("/store/products", { onRequest: [verifyJwt] }, getAllProductsByUser);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  usersStoreRoutes
});
