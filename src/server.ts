import { environment } from "./env/env";

import { app } from "@/app";

app
  .listen({
    host: "0.0.0.0",
    port: environment.PORT,
  })
  .then((address) => {
    console.log(`🔥 HTTP Server Running! ${address}`);
  });
