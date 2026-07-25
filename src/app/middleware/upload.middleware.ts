import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ApiError } from "../error/ApiError";

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chat-app/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 300, height: 300, crop: "fill", gravity: "face" }, // face detect
    ],
  } as object,
});

//file filter
const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JPG, PNG, and WebP images are allowed"));
  }
};

// Multer Instance
export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max
  },
  fileFilter: imageFileFilter,
}).single("avatar");

// Wrapper -- Pass the Multer error to the Express error handler.
export const handleAvatarUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  uploadAvatar(req, res, (err) => {
    if (!err) return next();
    // Multer specific errors
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new ApiError(400, "File size must be less than 2MB"));
      }
      return next(new ApiError(400, err.message));
    }
    next(err); // handle the error: apiError or global error handler
  });
};
