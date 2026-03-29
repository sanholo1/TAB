import type { AuthTokenPayload } from "./auth.js";

declare module "express-serve-static-core" {
  interface Request {
    authUser?: AuthTokenPayload;
  }
}
