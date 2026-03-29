import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { HttpError } from "../errors/http-error.js";
import { getProfileById, updateProfileById } from "../services/auth-service.js";
import { profileUpdateSchema } from "../validation/profile-schemas.js";
import { validateRequest } from "../validation/validate-request.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res) => {
  if (!req.authUser) {
    throw new HttpError(401, "Unauthorized");
  }

  const profile = await getProfileById(req.authUser.userId);

  res.json(profile);
});

router.patch("/", async (req, res) => {
  if (!req.authUser) {
    throw new HttpError(401, "Unauthorized");
  }

  const payload = validateRequest(profileUpdateSchema, req.body);
  const profile = await updateProfileById(req.authUser.userId, payload);

  res.json({
    message: "Profile updated",
    profile,
  });
});

export default router;
