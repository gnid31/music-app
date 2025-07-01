import { PrismaClient } from "@prisma/client";
import type { User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import redisClient from "../config/redisClient";
import { CustomError } from "../utils/customError";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

const findUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    return user;
  } catch (error) {
    console.error("Error finding user by username (service):", error);
    throw error;
  }
};

const createUser = async (
  name: string,
  username: string,
  hashedPassword: string
): Promise<User | null> => {
  try {
    const user = await prisma.user.create({
      data: {
        name: name,
        username: username,
        password: hashedPassword,
      },
    });
    console.log(`Service: Created user with ID: ${user.id}`);
    return user;
  } catch (error) {
    console.error("Error creating user (service):", error);
    throw error;
  }
};

const registerUserService = async (
  name: string,
  username: string,
  password: string
): Promise<User | null> => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await createUser(name, username, hashedPassword);

    console.log(`Service: Registered user ${username}`);
    return newUser;
  } catch (error) {
    console.error("Service Registration error:", error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Registration failed due to an unexpected error.");
  }
};

const JWT_SECRET = process.env.JWT_SECRET as string;

const loginUserService = async (
  username: string,
  password: string
): Promise<string> => {
  const user = await findUserByUsername(username);

  if (!user) {
    throw new CustomError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new CustomError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "1h",
  });

  return token;
};

const logoutUserService = async (token: string, user: any) => {
  try {
    const expiresAt = user.exp;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;

    if (timeUntilExpiry > 0) {
      const redisKey = `blacklist:${token}`;
      await redisClient.set(redisKey, "blacklisted", "EX", timeUntilExpiry);
      console.log(
        `Service: Token added to Redis blacklist with TTL ${timeUntilExpiry}s: ${token}`
      );
    } else {
      console.log(`Service: Attempted to blacklist an expired token: ${token}`);
      throw new CustomError(StatusCodes.BAD_REQUEST, "Token is already expired.");
    }

    return { success: true, message: "Logout successful" };
  } catch (error) {
    console.error("Service Logout error:", error);
    throw error;
  }
};

export {
  findUserByUsername,
  loginUserService,
  logoutUserService,
  registerUserService
};
