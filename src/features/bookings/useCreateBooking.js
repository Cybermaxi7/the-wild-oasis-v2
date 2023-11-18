import toast from "react-hot-toast";
import { createBooking as createBookingAPI } from "../../services/apiBookings";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateBooking() {
    const queryClient = useQueryClient();
    //Create Cabind instance
    const { mutate: createBooking, isPending: isCreatingBooking } = useMutation({
        mutationFn: createBookingAPI,
        onSuccess: () => {
            toast.success("New Booking Succesfully booked!");
            queryClient.invalidateQueries({
                queryKey: ["booking"],
            });
        },

        onError: (error) => {
            toast.error(error.message);
        },
    });
    return {createBooking, isCreatingBooking}
}