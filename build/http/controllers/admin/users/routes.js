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

// src/http/controllers/admin/users/routes.ts
var routes_exports = {};
__export(routes_exports, {
  usersRoutes: () => usersRoutes
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
var import_zod3 = require("zod");
async function getAllUsers(request, reply) {
  const UsersParamsSchema = import_zod3.z.object({
    page: import_zod3.z.coerce.number().min(1).default(1),
    query: import_zod3.z.string().default("")
  });
  const { query, page } = UsersParamsSchema.parse(request.query);
  const getAllUsers2 = makeGetAllUsersUseCase();
  const { users, total } = await getAllUsers2.execute({
    page,
    query
  });
  return reply.status(200).send({ users, total });
}

// src/use-cases/erros/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found");
  }
};

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
var import_zod4 = require("zod");
async function register(request, reply) {
  const registerUserBodySchema = import_zod4.z.object({
    name: import_zod4.z.string(),
    email: import_zod4.z.string().email(),
    cpf: import_zod4.z.string().length(14),
    phone: import_zod4.z.string().length(15)
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
var import_zod5 = require("zod");
async function updateUser(request, reply) {
  const updateUserBodySchema = import_zod5.z.object({
    name: import_zod5.z.string(),
    email: import_zod5.z.string().email(),
    cpf: import_zod5.z.string().length(14),
    phone: import_zod5.z.string().length(15)
  });
  const updateUserParamsSchema = import_zod5.z.object({
    userId: import_zod5.z.string().uuid()
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
async function usersRoutes(app) {
  app.post("/sessions", authenticate);
  app.patch("/token/refresh", refresh);
  app.get("/me", { onRequest: [verifyJwt] }, profile);
  app.get(
    "/users",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    getAllUsers
  );
  app.post(
    "/users",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    register
  );
  app.put(
    "/users/:userId",
    { onRequest: [verifyJwt, verifyUserRole("ADMIN")] },
    updateUser
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  usersRoutes
});
