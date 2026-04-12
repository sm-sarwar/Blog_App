import { Post } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";


const postCreate = async (data: Omit<Post, "id" | "createdAt" | "updatedAt">) => {
    const result = await prisma.post.create({
        data
    })
    return result;
}

const getALLPosts  = async ()=> {
    const result = await prisma.post.findMany()
    return result;
}

export const postService = {
    postCreate,
    getALLPosts
}