import { Post } from "../../../generated/prisma/client";
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
            }
        })
        return postData;
    })


}

export const postService = {
    postCreate,
    getALLPosts,
    getPostById
}