import express from "express"
import { postController } from "./post.controller";

const router = express.Router()

router.post ('/', postController.postCreate)
router.get ('/', postController.getAllPosts)




export const  postRouter = router;