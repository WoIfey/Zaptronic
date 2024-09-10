"use server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateUser(id: string, values: any) {
    await prisma.user.update({
        where: { id },
        data: {
            name: values.name || undefined,
            image: values.image || undefined
        }
    })
    revalidatePath('/')
}