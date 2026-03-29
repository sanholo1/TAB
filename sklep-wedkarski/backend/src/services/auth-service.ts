import bcrypt from "bcryptjs";
import prisma from "../prisma/prisma.js";
import { HttpError } from "../errors/http-error.js";
import { signAuthToken } from "../lib/jwt.js";
import type { PublicUser } from "../types/auth.js";
import type { ProfileUpdateSchema } from "../validation/profile-schemas.js";

type RegisterInput = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type ProfileUpdateInput = ProfileUpdateSchema;

type UserPublicSource = {
  id_uzytkownika: number;
  nazwa: string;
  imie: string;
  nazwisko: string;
  email: string;
  id_roli: number;
  rola: {
    nazwa: string;
  };
};

const defaultRoleName = "klient";

const publicUserSelect = {
  id_uzytkownika: true,
  nazwa: true,
  imie: true,
  nazwisko: true,
  email: true,
  id_roli: true,
  rola: {
    select: {
      nazwa: true,
    },
  },
};

const toPublicUser = (user: UserPublicSource): PublicUser => {
  return {
    id: user.id_uzytkownika,
    username: user.nazwa,
    firstName: user.imie,
    lastName: user.nazwisko,
    email: user.email,
    roleId: user.id_roli,
    roleName: user.rola.nazwa,
  };
};

const getDefaultRoleId = async (): Promise<number> => {
  const role = await prisma.rola.upsert({
    where: {
      nazwa: defaultRoleName,
    },
    update: {},
    create: {
      nazwa: defaultRoleName,
    },
  });

  return role.id_roli;
};

export const registerUser = async (payload: RegisterInput): Promise<void> => {
  const existingUser = await prisma.uzytkownik.findFirst({
    where: {
      OR: [{ email: payload.email }, { nazwa: payload.username }],
    },
    select: {
      id_uzytkownika: true,
    },
  });

  if (existingUser) {
    throw new HttpError(409, "User with provided email or username already exists");
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const roleId = await getDefaultRoleId();

  try {
    await prisma.uzytkownik.create({
      data: {
        nazwa: payload.username,
        imie: payload.firstName,
        nazwisko: payload.lastName,
        email: payload.email,
        haslo: passwordHash,
        id_roli: roleId,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === "P2002"
    ) {
      throw new HttpError(409, "User with provided email or username already exists");
    }

    throw error;
  }
};

export const loginUser = async (payload: LoginInput): Promise<{ accessToken: string; user: PublicUser }> => {
  const user = await prisma.uzytkownik.findFirst({
    where: {
      email: payload.email,
    },
    select: {
      id_uzytkownika: true,
      haslo: true,
      id_roli: true,
      rola: {
        select: {
          nazwa: true,
        },
      },
      nazwa: true,
      imie: true,
      nazwisko: true,
      email: true,
    },
  });

  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.haslo);

  if (!isPasswordValid) {
    throw new HttpError(401, "Invalid email or password");
  }

  const accessToken = signAuthToken({
    userId: user.id_uzytkownika,
    roleId: user.id_roli,
  });

  return {
    accessToken,
    user: toPublicUser(user),
  };
};

export const getProfileById = async (userId: number): Promise<PublicUser> => {
  const user = await prisma.uzytkownik.findUnique({
    where: {
      id_uzytkownika: userId,
    },
    select: publicUserSelect,
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return toPublicUser(user);
};

export const updateProfileById = async (userId: number, payload: ProfileUpdateInput): Promise<PublicUser> => {
  const currentUser = await prisma.uzytkownik.findUnique({
    where: {
      id_uzytkownika: userId,
    },
    select: {
      id_uzytkownika: true,
      haslo: true,
      email: true,
      nazwa: true,
    },
  });

  if (!currentUser) {
    throw new HttpError(404, "User not found");
  }

  if (payload.email || payload.username) {
    const duplicateUser = await prisma.uzytkownik.findFirst({
      where: {
        id_uzytkownika: {
          not: userId,
        },
        OR: [
          payload.email ? { email: payload.email } : undefined,
          payload.username ? { nazwa: payload.username } : undefined,
        ].filter((value): value is { email: string } | { nazwa: string } => value !== undefined),
      },
      select: {
        id_uzytkownika: true,
      },
    });

    if (duplicateUser) {
      throw new HttpError(409, "Email or username is already taken");
    }
  }

  if (payload.newPassword) {
    const isCurrentPasswordValid = await bcrypt.compare(payload.currentPassword ?? "", currentUser.haslo);

    if (!isCurrentPasswordValid) {
      throw new HttpError(401, "Current password is invalid");
    }
  }

  const updateData: {
    nazwa?: string;
    imie?: string;
    nazwisko?: string;
    email?: string;
    haslo?: string;
  } = {};

  if (payload.username !== undefined) {
    updateData.nazwa = payload.username;
  }

  if (payload.firstName !== undefined) {
    updateData.imie = payload.firstName;
  }

  if (payload.lastName !== undefined) {
    updateData.nazwisko = payload.lastName;
  }

  if (payload.email !== undefined) {
    updateData.email = payload.email;
  }

  if (payload.newPassword !== undefined) {
    updateData.haslo = await bcrypt.hash(payload.newPassword, 12);
  }

  try {
    const updatedUser = await prisma.uzytkownik.update({
      where: {
        id_uzytkownika: userId,
      },
      data: updateData,
      select: publicUserSelect,
    });

    return toPublicUser(updatedUser);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === "P2002"
    ) {
      throw new HttpError(409, "Email or username is already taken");
    }

    throw error;
  }
};
