import React from 'react'
import { getAuthUser } from "../lib/api";

//tanstack query for query control - connecting frontend to backend by sending requests or fetching of data from backend
import { useQuery } from '@tanstack/react-query';
 
const useAuthUser = () => {
    const authUser = useQuery({
        queryKey: ["authUser"], 
        queryFn:getAuthUser,  //function is defined in lib/api
        retry: false,    // auth check
      });

    return {isLoading : authUser.isLoading, authUser: authUser.data?.user };

    }

export default useAuthUser