import { CommentStatus, Post } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";


const postCreate = async (data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    })
    return result;
}




const getALLPosts = async ({
    search, tags, isFeatured, page, limit, skip, sortBy, sortOrder }:

    { search?: string | undefined, tags: string[] | [], isFeatured?: boolean | undefined, page: number, limit: number, skip: number, sortBy: string, sortOrder: string }) => {

    const andConditions: PostWhereInput[] = []

    if (search) {
        andConditions.push(
            {
                OR: [
                    {
                        title: {
                            contains: search as string,
                            mode: "insensitive"
                        }
                    },
                    {
                        content: {
                            contains: search as string,
                            mode: "insensitive"
                        }
                    },
                    {
                        tags: {
                            has: search as string
                        }
                    }
                ]
            }
        )
    }

    if (tags.length > 0) {
        andConditions.push(
            {
                tags: {
                    hasEvery: tags
                }
            }
        )
    }

    if (typeof isFeatured === "boolean") {
        andConditions.push(
            {
                isFeatured
            }
        )
    }
    const result = await prisma.post.findMany({
        take: limit,
        skip,
        where: {
            AND: andConditions
        },
        orderBy: {
            [sortBy]: sortOrder
        },
        include : {
            _count : {
                select : {comments: true}
            }
        }
    })


    const totalCount = await prisma.post.count({
        where: {
            AND: andConditions
        }
    })
    return {
        data: result,
        pagination: {
            total: totalCount
        },
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
    };
}

const getPostById = async (postId: string) => {

    return await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id: postId
            },
            data: {
                views: {
                    increment: 1
                }
            }
        })

        const postData = await tx.post.findUnique({
            where: {
                id: postId
            },
            include: {
                comments: {
                    where: {
                        parentId: null,
                        status : CommentStatus.APPROVED
                    },
                    orderBy:{
                        createdAt: 'desc'
                    },
                    include: {
                        replies: {
                            where: {
                                status : CommentStatus.APPROVED
                            },
                            orderBy: {
                                createdAt: 'asc'
                            },
                            include: {
                                replies: {
                                    where: {
                                        status : CommentStatus.APPROVED
                                    },
                                    orderBy: {
                                        createdAt: "asc"
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {comments: true}
                }
            }
        })
        return postData;
    })


}




const getMyPosts = async(authorId: string) =>  {

    await prisma.user.findUniqueOrThrow({
        where : {
            id : authorId,
            status : "ACTIVE"
        },
        select : {
            id : true
        }
    })

    const result= await prisma.post.findMany({
        where : {
            authorId : authorId
        },
        orderBy : {
            createdAt : "desc"
        },
        include : {
            _count: {
                select : {
                    comments: true
                }
            }
        }
    })
    const total = await prisma.post.aggregate({
        _count : {
            id : true
        },
        where : {
            authorId 
        }
    })
    return {
        data : result,
        total
    }
}


const updatePost = async (postId : string, data : Partial<Post>,authorId: string, isAdmin : boolean) =>{
    const postData = await prisma.post.findUniqueOrThrow({
        where : {
            id : postId
        },
        select : {
            id: true,
            authorId: true
        }
    })
     
    if(!isAdmin && (postData.authorId !== authorId)){
        throw new Error ("You are not the owner/creator of this post")
    }

    if(!isAdmin) {
        delete data.isFeatured
    }

    if(postData.authorId !== authorId){
        throw new Error ("YOu are not the owner/creator of the post")
    }

    const result = await prisma.post.update ({
        where : {
            id : postData.id
        },
        data
    })

    return result;
}


const deletePost = async () =>{
    console.log("Deleted the post")
}


export const postService = {
    postCreate,
    getALLPosts,
    getPostById,
    getMyPosts,
    updatePost,
    deletePost
}