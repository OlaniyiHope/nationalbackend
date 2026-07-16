import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  getPostsByCategory,
  getBreakingPosts,
  getTrendingPosts,
  getFeaturedPosts,
  getEditorsPickPosts,
  getPostsByTag,
} from "../controller/DbpostController.js";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function multerS3NoAcl(options) {
  const storage = multerS3(options);

  const origGetS3Params = storage.getS3Params;
  storage.getS3Params = (file, cb) => {
    origGetS3Params.call(storage, file, (err, params) => {
      if (params.ACL) {
        delete params.ACL;
      }
      cb(err, params);
    });
  };

  return storage;
}

const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB — adjust to taste

const upload = multer({
  storage: multerS3NoAcl({
    s3,
    bucket: "edupros",
    contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {

  let folder = "Dbnewspaper";

  if(file.fieldname === "videos"){
    folder = "Dbnewspaper-videos";
  }

  if(file.fieldname === "videoImage"){
    folder = "Dbnewspaper-video-thumbnails";
  }


  const cleanName = file.originalname
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.-]/g, "");


  const fileKey = `${folder}/${Date.now()}-${cleanName}`;

  cb(null, fileKey);
}
  }),
  limits: {
    fileSize: MAX_VIDEO_SIZE, // applies to the largest allowed file across all fields
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "images" && !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed for the images field"));
    }
    if (file.fieldname === "videos" && !file.mimetype.startsWith("video/")) {
      return cb(new Error("Only video files are allowed for the videos field"));
    }
    cb(null, true);
  },
});

router.post(
  "/create-post",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 2 },
     { name: "videoImage", maxCount: 1 },
  ]),
  createPost
);

router.get("/posts", getPosts);
router.get("/post/:id", getPostById);
router.get("/post/slug/:slug", getPostBySlug);

router.get("/posts/category/:categoryId", getPostsByCategory);
router.get("/posts/breaking", getBreakingPosts);
router.get("/posts/trending", getTrendingPosts);
router.get("/posts/featured", getFeaturedPosts);
router.get("/posts/editors-pick", getEditorsPickPosts);
router.get("/posts/tag/:tag", getPostsByTag);

router.put(
  "/post/:id",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 3 },
  ]),
  updatePost
);

router.delete("/post/:id", deletePost);

export default router;