import { CommentStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"



const getCommentsById = async (id: string) => {
    return await prisma.comment.findUnique({
        where: {
            id
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    views: true
                }
            }
        }
    })
}


const getCommentsByAuthor = async (id: string) => {
    return await prisma.comment.findMany({
        where: {
            authorId: id
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    })
}


const createComment = async (payload: {
    content: string,
    postId: string,
    authorId: string,
    parentId?: string
}) => {

    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId
        }
    })

    if (payload.parentId) {
        await prisma.comment.findUniqueOrThrow({
            where: {
                id: payload.parentId
            }
        })
    }


    return await prisma.comment.create({
        data: payload
    })
}



const deleteComment = async (commentId: string, authorId: string) => {
    // console.log({commentId, authorId})
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select: {
            id: true
        }
    })

    if (!commentData) {
        throw new Error("Comment not found or you don't have permission to delete this comment")
    }

    return await prisma.comment.delete({
        where: {
            id: commentData.id
        }
    })
}

const updateComment = async (commentId: string, data: { content?: string, status?: CommentStatus }, authorId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select: {
            id: true
        }
    })

    if (!commentData) {
        throw new Error("Comment not found or you don't have permission to delete this comment")
    }

    return await prisma.comment.update({
        where: {
            id: commentId
        },
        data
    })
}


const moderateComment = async (id: string, data: { status?: CommentStatus }) => {
    const commentData =await prisma.comment.findUniqueOrThrow({
        where: {
            id 
        },
        select : {
            id : true,
            status : true
        }
    })

    if( commentData.status === data.status) {
        throw new Error (`Comment is already ${data.status}`)
    }

    return await prisma.comment.update({
        where: {
            id 
        },
        data
    })
}

export const commentService = {
    createComment,
    getCommentsById,
    getCommentsByAuthor,
    deleteComment,
    updateComment,
    moderateComment
}
