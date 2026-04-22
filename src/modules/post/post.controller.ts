import { Request, Response } from "express";
import { postService } from "./post.service";
import paginationSortingHelper from "../../helper/paginationSortingHelper";
import { UserRole } from "../../middlewares/auth";

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
        const { search } = req.query
        // console.log("search value:", search)
        const searchString = typeof search === "string" ? search : undefined

        const tags = req.query.tags ? (req.query.tags as string).split(",") : []

        const isFeatured = req.query.isFeatured ? req.query.isFeatured === "true" : undefined
        // console.log({isFeatured})



        const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(req.query)


        const result = await postService.getALLPosts({ search: searchString, tags, isFeatured, page, limit, skip, sortBy, sortOrder })
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({
            error: err,
            message: "An error occurred while fetching posts."
        })
    }
}

const getPostById = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params
        if (!postId) {
            throw new Error("Post ID is required in the request parameters.")
        }
        const result = await postService.getPostById(postId as string)
        res.status(200).json(result)

    } catch (err) {
        res.status(500).json({
            error: err,
            message: "An error occurred while fetching the post."
        })
    }
}


const getMyPosts = async (req: Request, res: Response) => {
    try {
        const user = req.user
        if(!user) {
            throw new Error("User information is missing in the request.")
        }
        const result = await postService.getMyPosts( user.id )
        res.status(200).json(result)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            error: e,
            message: "An error occurred while fetching the post."
        })
    }
}


const updatePost = async (req: Request, res: Response) =>{
    try{
        const user = req.user
        if(!user) {
            throw new Error ("You are unauthorized")
        }

        const {postId}= req.params
        const isAdmin = user.role === UserRole.ADMIN;
        const result = await postService.updatePost(postId as string, req.body, user.id, isAdmin)
        res.status(200).json(result)


    }catch(error) {
        res.status(500).json({
            error: error,
            message : "Post update failed"
        })
    }
}

const deletePost = async (req: Request, res: Response)=>{
    try{
        const result = await postService.deletePost()
        res.status(200).json(result)

    }catch(error) {
        res.status(500).json({
            error : error,
            message : "Post delete failed"
        })
    }
}

export const postController = {
    postCreate,
    getAllPosts,
    getPostById,
    getMyPosts,
    updatePost,
    deletePost
}