import { PrismaClient, User } from "@prisma/client";
import { IProfile } from "../dto/auth.dto";
import { CustomError } from "../utils/customError";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

const getProfileService = async (id: number): Promise<IProfile> => {
  const profile = await prisma.user.findUnique({
    where: { id },
    select: {
      name: true,
      id: true,
    },
  });

  if (!profile) {
    throw new CustomError(StatusCodes.NOT_FOUND, "User not found.");
  }
  return profile;
};

export { getProfileService }; 