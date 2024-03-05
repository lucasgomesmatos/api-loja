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

// src/http/controllers/store/register.ts
var register_exports = {};
__export(register_exports, {
  registerUserStore: () => registerUserStore
});
module.exports = __toCommonJS(register_exports);

// src/use-cases/erros/user-already-exists-error.ts
var UserAlreadyExistsError = class extends Error {
  constructor() {
    super("E-mail already exists");
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
  JWT_SECRET: import_zod.z.string()
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

// src/repositories/prisma/prisma-orders-repository.ts
var PrismaOrdersRepository = class {
  async create(data) {
    await prisma.order.create({
      data: {
        status: data.status,
        id: data.id,
        userId: data.user_id,
        products_ids: data.products,
        json: data.json
      }
    });
  }
};

// src/repositories/prisma/prisma-users-store-repository.ts
var PrismaUsersStoreRepository = class {
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
};

// src/use-cases/register-user-store.ts
var import_bcryptjs = require("bcryptjs");
var RegisterUserStoreUseCase = class {
  constructor(usersStoreRepository, ordersRepository) {
    this.usersStoreRepository = usersStoreRepository;
    this.ordersRepository = ordersRepository;
  }
  async execute({
    id,
    status,
    billing,
    line_items
  }) {
    const userEmailExists = await this.usersStoreRepository.findByEmail(
      billing.email
    );
    if (userEmailExists) {
      this.createOrder({ id, status, line_items }, userEmailExists.id);
      return;
    }
    const passwordHash = await (0, import_bcryptjs.hash)(billing.cpf, 6);
    const user = await this.usersStoreRepository.create({
      name: billing.first_name.concat(" ", billing.last_name),
      email: billing.email,
      password_hash: passwordHash,
      phone: billing.phone,
      cpf: billing.cpf
    });
    this.createOrder({ id, status, line_items }, user.id);
  }
  async createOrder(data, userId) {
    const { id, status, line_items } = data;
    const productsIds = line_items.map((item) => item.product_id);
    this.ordersRepository.create({
      id,
      status,
      user_id: userId,
      products: productsIds,
      json: JSON.stringify({
        data,
        userId
      })
    });
  }
};

// src/use-cases/factories/make-register-user-store-use-case.ts
function makeRegisterUserStoreUseCase() {
  const prismaUsersStoreRepository = new PrismaUsersStoreRepository();
  const prismaOrdersRepository = new PrismaOrdersRepository();
  const registerUserUseCase = new RegisterUserStoreUseCase(
    prismaUsersStoreRepository,
    prismaOrdersRepository
  );
  return registerUserUseCase;
}

// src/http/controllers/store/register.ts
var import_zod2 = require("zod");
async function registerUserStore(request, reply) {
  const registerUserStoreBodySchema = import_zod2.z.object({
    id: import_zod2.z.number(),
    status: import_zod2.z.enum(["pending", "completed", "canceled"]),
    billing: import_zod2.z.object({
      first_name: import_zod2.z.string(),
      last_name: import_zod2.z.string(),
      email: import_zod2.z.string().email(),
      phone: import_zod2.z.string().optional(),
      cpf: import_zod2.z.string().optional()
    }),
    line_items: import_zod2.z.array(
      import_zod2.z.object({
        id: import_zod2.z.number(),
        product_id: import_zod2.z.number(),
        name: import_zod2.z.string(),
        price: import_zod2.z.number()
      })
    )
  });
  const { id, status, billing, line_items } = registerUserStoreBodySchema.parse(
    request.body
  );
  try {
    const registerUserStoreUseCase = makeRegisterUserStoreUseCase();
    registerUserStoreUseCase.execute({
      id,
      status,
      billing,
      line_items
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  registerUserStore
});
