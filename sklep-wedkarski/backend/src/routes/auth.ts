import { Router } from "express";
import { loginUser, registerUser } from "../services/auth-service.js";
import { loginSchema, registerSchema } from "../validation/auth-schemas.js";
import { validateRequest } from "../validation/validate-request.js";

const router = Router();

router.post("/register", async (req, res) => {
  const payload = validateRequest(registerSchema, req.body);

  const result = await registerUser({
    username: payload.username,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    password: payload.password,
  });

  res.status(201).json({
    message: "Registration successful",
    redirectTo: "/profile",
    accessToken: result.accessToken,
    user: result.user,
  });
});

router.post("/login", async (req, res) => {
  const payload = validateRequest(loginSchema, req.body);
  const result = await loginUser(payload);

  res.json({
    message: "Login successful",
    redirectTo: "/dashboard",
    accessToken: result.accessToken,
    user: result.user,
  });
});

export default router;
