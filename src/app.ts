import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastify from "fastify";
import { ZodError } from "zod";
import { environment } from "./env/env";
import { uploadsRoutes } from "./http/controllers/admin/product/routes";
import { usersRoutes } from "./http/controllers/admin/users/routes";
import { usersStoreRoutes } from "./http/controllers/store/routes";

export const app = fastify();

app.register(fastifyJwt, {
  secret: environment.JWT_SECRET,
  cookie: {
    cookieName: "refreshToken",
    signed: false,
  },
  sign: {
    expiresIn: "10m",
  },
});

app.register(fastifyCookie);
app.register(usersRoutes);
app.register(usersStoreRoutes);
app.register(uploadsRoutes);
// app.register(usersRoutes);

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      message: "Validation error",
      issues: error.format(),
    });
  }

  if (environment.NODE_ENV !== "production") {
    console.error(error);
  } else {
    // TODO: send error to external tool Sentry/Datadog/New Relic
  }

  console.error(error);

  reply.status(500).send({
    message: "Internal server error",
  });
});
