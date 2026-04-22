import express from "express"
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router()


router.post ('/', auth(UserRole.ADMIN), postController.postCreate)
router.get ('/', postController.getAllPosts)
router.get('/my-posts',
     auth(UserRole.ADMIN, UserRole.USER), 
     postController.getMyPosts)


router.get('/:postId', postController.getPostById)


router.patch('/:postId', auth(UserRole.ADMIN, UserRole.USER) , postController.updatePost)

router.delete('/:postId', auth(UserRole.ADMIN, UserRole.USER) , postController.deletePost)


export const  postRouter = router;