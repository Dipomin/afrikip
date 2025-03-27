import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "../../lib/prisma";

export default async function handlerArticle(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const prisma = new PrismaClient();

    if (req.method !== 'GET') {
        return res.status(405).end();
    }

    try {
        const { pluLusId } = req.query;
        if (!pluLusId || typeof pluLusId !== 'number') {
            throw new Error('ID Invalide')
        }

        const plusLus = await prisma.ap_popularpostsdata.findMany ({
            where: {
                postid: pluLusId,
            },
                orderBy: {
                    pageviews: 'desc'
                }
        })
        return res.status(200).json(plusLus)
    } catch(error) {
        console.log(error);
        return res.status(400).end();
    }
}