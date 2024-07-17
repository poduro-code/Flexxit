import { NextApiRequest, NextApiResponse } from "next";
import { without } from "lodash";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";
import Email from "next-auth/providers/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    try {
    if (req.method === 'POST') {
        const { currentUser } = await serverAuth(req);
        const { movieId } = req.body;
        const existingmovie = await prismadb.movie.findUnique({
            where: {
                id: movieId,
            }
        });

        if (!existingmovie) {
            throw new Error ('Invalid ID');
        }
        
        const user= await prismadb.user.update({
            where: {
                email: currentUser.email || '',
            },
            data: {
                favouriteIds: {
                    push: movieId,
                }
            }
        });
        return res.status(200).json(user);
    }

    if (req.method === 'DELETE') {
        const {currentUser} = await serverAuth(req);
        const {movieId} = req.body;
        const existingmovie = await prismadb.movie.findUnique({
            where: {
                id:movieId,
            }
        });

        if (!existingmovie) {
            throw Error ('Invalid ID');
        }

        const updatedFavouriteIds = without(currentUser.favouriteIds, movieId);
        const updatedUser = await prismadb.user.update ({
            where: {
                email: currentUser.email || '',
            },
            data: {
               favouriteIds : updatedFavouriteIds
            }
        });
        return res.status(200).json(updatedUser);
    }

    return res.status(405).end();
} catch (error) {
        console.log(error);
        return res.status(400).end();
    }
}
