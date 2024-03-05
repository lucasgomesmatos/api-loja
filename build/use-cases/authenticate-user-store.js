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

// src/use-cases/authenticate-user-store.ts
var authenticate_user_store_exports = {};
__export(authenticate_user_store_exports, {
  AuthenticateUserStoreUseCase: () => AuthenticateUserStoreUseCase
});
module.exports = __toCommonJS(authenticate_user_store_exports);

// src/use-cases/erros/invalid-credentials-error.ts
var InvalidCredentialsError = class extends Error {
  constructor() {
    super("Invalid credentials");
  }
};

// src/use-cases/authenticate-user-store.ts
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthenticateUserStoreUseCase
});
