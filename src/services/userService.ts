import { PrismaClient, User } from "@prisma/client";
import { IProfile } from "../dto/auth.dto";

const prisma = new PrismaClient();

const getProfileService = async (id: number): Promise<IProfile | null> => {
  try {
    const profile = await prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        id: true,
      }
    });
    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export { getProfileService };
