import axios from "axios";
import React, { useCallback, useMemo } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import useFavourites from "@/hooks/useFavourites";
import { AiOutlinePlus, AiOutlineCheck } from "react-icons/ai";

interface FavouriteButtonProps {
    movieId: string;
}

const FavouriteButton: React.FC <FavouriteButtonProps> = ({ movieId }) => {
    const { mutate: mutateFavourites } = useFavourites();
    const { data: currentUser, mutate } = useCurrentUser();

    if (!currentUser || !currentUser.token) {
        console.error('User is not authenticated');
        return;
    }

    const headers = {
        Authorization: `Bearer ${currentUser.token}`,
    };

    const isFavourite = useMemo (()=> {
        const list = currentUser?.favouriteIds || [];
        return list.includes(movieId);
    }, [currentUser, movieId]);

    const toggleFavourites = useCallback(async () => {
        let response;
        
        if(isFavourite) {
            response = await axios.delete('/api/favourite', { 
                data: {movieId}, 
                headers 
            });
        } else{
            response = await axios.post('/api/favourite', { 
                movieId, 
                headers 
            });
        }
        const updatedFavouriteIds = response?.data?.favouriteIds;

        mutate({
            ...currentUser,
            favouriteIds: updatedFavouriteIds
        });

        mutateFavourites();
    }, [movieId, isFavourite, currentUser, mutate, mutateFavourites]);

    const Icon = isFavourite ? AiOutlineCheck : AiOutlinePlus;
    

    return (
        <div 
        onClick={toggleFavourites}
        className="cursor-pointer 
        group/item 
        w-6 
        h-6 
        lg:w-10 
        lg:h-10 
        border-white 
        border-2 
        rounded-full 
        flex 
        justify-center 
        items-center 
        transition 
        hover:border-netural-300">
            <Icon className="text-white" size={25}/>
        </div>
    )
}

export default FavouriteButton;