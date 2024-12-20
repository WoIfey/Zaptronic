"use server"
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function fetchOrders(id: string) {
    return await prisma.orders.findMany({
        where: {
            userId: id,
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            products: {
                include: {
                    images: true
                }
            }
        },
    });
}

export async function cancelOrder(id: number) {
    await prisma.orders.update({
        where: {
            orderId: id,
        },
        data: {
            order_status: "Cancelled",
        }
    })
    revalidatePath('/')
}