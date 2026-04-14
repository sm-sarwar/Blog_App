import { Request, Response } from "express";
import { postService } from "./post.service";

const postCreate = async (req: Request, res: Response) => {
    try {
        const user = req.user
        if (!user) {
            return res.status(500).json({
                error: "User information is missing in the request."
            })
        }
        const result = await postService.postCreate(req.body, user.id as string)
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "An error occurred while creating the post."
        })
    }
}


const getAllPosts = async (req: Request, res: Response) => {
    try {
        const {search} = req.query
        // console.log("search value:", search)
        const searchString = typeof search === "string" ? search : undefined

        const tags = req.query.tags? (req.query.tags as string).split(",") : []

        const isFeatured = req.query.isFeatured ? req.query.isFeatured === "true" : undefined
        // console.log({isFeatured})

        const result = await postService.getALLPosts({search : searchString, tags, isFeatured})
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({
            error: err,
            message: "An error occurred while fetching posts."
        })
    }
}

export const postController = {
    postCreate,
    getAllPosts
}