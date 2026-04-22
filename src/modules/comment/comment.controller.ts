import { Request, Response } from "express";
import { commentService } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
    try {
        const user = req.user
        req.body.authorId = user?.id
        const result = await commentService.createComment(req.body)
        res.status(201).json(result)

    } catch (error) {
        res.status(500).json({
            error: error,
            message: 'Failed to create comment'
        })
    }
}

const getCommentsById = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params
        const result = await commentService.getCommentsById(commentId as string)
        res.status(200).json(result)

    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Failed to get comments"
        })
    }
}

const getCommentsByAuthor = async (req: Request, res: Response) => {
    try {
        const { authorId } = req.params
        const result = await commentService.getCommentsByAuthor(authorId as string)
        res.status(200).json(result)

    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Failed to get comments"
        })
    }
}

const deleteComment = async (req: Request, res: Response) => {
    try {
        const user = req.user
        const { commentId } = req.params
        const result = await commentService.deleteComment(commentId as string, user?.id as string)
        res.status(200).json(result)

    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Failed to delete comment"
        })
    }
}


const updateComment = async (req: Request, res: Response) => {
    try {
        const user = req.user
        const { commentId } = req.params
        const result = await commentService.updateComment(commentId as string, req.body, user?.id as string)
        res.status(200).json(result)

    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Failed to update comment"
        })
    }
}



const moderateComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params
        const result = await commentService.moderateComment(commentId as string, req.body)
        res.status(200).json(result)

    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Failed to moderate comment"
        res.status(500).json({
            error: errorMessage,
            message: "Failed to moderate comment"
        })
    }
}

export const commentController = {
    createComment,
    getCommentsById,
    getCommentsByAuthor,
    deleteComment,
    updateComment,
    moderateComment
}