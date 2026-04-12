import { Request, Response } from "express";
import { postService } from "./post.service";

const postCreate = async (req: Request, res: Response) => {
    try {
        const result = await postService.postCreate(req.body)
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "An error occurred while creating the post."
        })
    }
}


const getAllPosts  = async (req : Request, res: Response) =>{
    try {
        const result = await postService.getALLPosts()
        res.status(200).json(result);
    }catch (err) {
        res.status (500).json({
            error: err,
            message: "An error occurred while fetching posts."
        })
    }
}

export const postController = {
    postCreate,
    getAllPosts
}