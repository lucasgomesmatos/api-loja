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
var import_jwt = __toESM(require("@fastify/jwt"));
var import_fastify = __toESM(require("fastify"));
var import_zod5 = require("zod");

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

// src/use-cases/erros/invalid-credentials-error.ts
var InvalidCredentialsError = class extends Error {
  constructor() {
    super("Invalid credentials");
  }
};

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
};

// src/use-cases/authenticate.ts
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
var import_zod2 = require("zod");
async function authenticate(request, reply) {
  const authenticateBodySchema = import_zod2.z.object({
    email: import_zod2.z.string().email(),
    password: import_zod2.z.string().min(6)
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

// src/use-cases/erros/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found");
  }
};

// src/use-cases/get-user-profile.ts
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

// src/use-cases/register-user.ts
var import_bcryptjs2 = require("bcryptjs");
var RegisterUserUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  async execute({
    name,
    email,
    password,
    cpf,
    phone
  }) {
    const userWithEmailAlreadyExists = await this.usersRepository.findByEmail(email);
    if (userWithEmailAlreadyExists)
      throw new UserAlreadyExistsError();
    const passwordHash = await (0, import_bcryptjs2.hash)(password, 6);
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
var import_zod3 = require("zod");
async function register(request, reply) {
  const registerUserBodySchema = import_zod3.z.object({
    name: import_zod3.z.string(),
    email: import_zod3.z.string().email(),
    password: import_zod3.z.string().min(6),
    cpf: import_zod3.z.string().optional(),
    phone: import_zod3.z.string().optional()
  });
  const { name, email, password, cpf, phone } = registerUserBodySchema.parse(
    request.body
  );
  try {
    const registerUserUseCase = makeRegisterUseCase();
    await registerUserUseCase.execute({
      name,
      email,
      password,
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
  app2.post("/users", { onRequest: [verifyUserRole("ADMIN")] }, register);
  app2.post("/sessions", authenticate);
  app2.patch("/token/refresh", refresh);
  app2.get("/me", { onRequest: [verifyJwt] }, profile);
}

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
var import_bcryptjs3 = require("bcryptjs");
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
    const passwordHash = await (0, import_bcryptjs3.hash)(billing.cpf, 6);
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

// src/http/controllers/store/routes.ts
async function usersStoreRoutes(app2) {
  app2.post("/store/users", registerUserStore);
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
app.register(import_cookie.default);
app.register(usersRoutes);
app.register(usersStoreRoutes);
app.setErrorHandler((error, _, reply) => {
  if (error instanceof import_zod5.ZodError) {
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
