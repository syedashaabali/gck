import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const USER_COOKIE_NAME = "gulmarg_user_token";
export const ADMIN_COOKIE_NAME = "gulmarg_admin_token";

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || "gulmarg-super-secret-jwt-key-2026";
  return new TextEncoder().encode(secret);
}

export interface UserTokenPayload {
  userId: string;
  phone: string;
  role: string;
}

export async function signUserToken(payload: UserTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getJwtSecretKey());
}

export async function verifyUserToken(
  token: string
): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    if (!payload.userId || typeof payload.userId !== "string") {
      return null;
    }
    return {
      userId: payload.userId,
      phone: String(payload.phone || ""),
      role: String(payload.role || "CUSTOMER"),
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyUserToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      addresses: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  return user;
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "ADMIN", isAdmin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretKey());
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload.role === "ADMIN" && payload.isAdmin === true;
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}
