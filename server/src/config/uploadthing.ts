import { createUploadthing } from "uploadthing/express";
import { UploadThingError } from "uploadthing/server";
import type { Request } from "express";

const f = createUploadthing();

import type { FileRouter } from "uploadthing/server";

export const uploadRouter: FileRouter = {
  // Rubric files
  rubricUploader: f({
    pdf:  { maxFileSize: "16MB", maxFileCount: 1 },
    blob: { maxFileSize: "16MB", maxFileCount: 1 }, // .doc / .docx / .txt
  })
    .middleware(async ({ req }) => {
      const expressReq = req as unknown as Request;
      if (!expressReq.isAuthenticated?.() || !expressReq.user) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: expressReq.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(`[UT] rubric uploaded by ${metadata.userId}: ${file.ufsUrl}`);
      return { uploadedBy: metadata.userId, url: file.ufsUrl, key: file.key };
    }),

  // Student submission files
  submissionUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 1 },
    pdf:   { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const expressReq = req as unknown as Request;
      if (!expressReq.isAuthenticated?.() || !expressReq.user) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: expressReq.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(`[UT] submission uploaded by ${metadata.userId}: ${file.ufsUrl}`);
      return { uploadedBy: metadata.userId, url: file.ufsUrl, key: file.key };
    }),
};
