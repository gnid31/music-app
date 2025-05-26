import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getProfileService } from "../services/userService";

const getProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = res.locals.user.id;
    const profile = await getProfileService(id);
    res.status(StatusCodes.OK).send(profile);
  } catch (error) {
    next(error);
  }
};

export { getProfileController };
