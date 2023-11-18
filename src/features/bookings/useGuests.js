import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getGuests } from "../../services/apiBookings";

//Hook for fetching the data in the first place
export function useGuests() {
    const {
        data: guests = [],
        isLoading: isLoadingGuests,
        error,
    } = useQuery({
        queryKey: ["guests"],
        queryFn: getGuests,
        
    });
    return { guests, isLoadingGuests,error };
}
