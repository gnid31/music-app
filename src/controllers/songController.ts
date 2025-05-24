import { Request, Response, NextFunction } from "express";
import {
  getAllSongsService,
  getSongByIdService,
} from "../services/songService";
import { StatusCodes } from "http-status-codes";

const getSongByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const song = await getSongByIdService(id);
    res.status(StatusCodes.OK).send(song);
  } catch (error) {
    next(error);
  }
};

const getAllSongsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const song = await getAllSongsService();
    res.status(StatusCodes.OK).send(song);
  } catch (error) {
    next(error);
  }
};

export { getSongByIdController, getAllSongsController };
