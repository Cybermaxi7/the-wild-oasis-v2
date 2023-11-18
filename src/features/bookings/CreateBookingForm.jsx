import { differenceInDays } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../../ui/Button";
import Checkbox from "../../ui/Checkbox";
import FileInput from "../../ui/FileInput";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import Textarea from "../../ui/Textarea";
import { useCabins } from "../cabins/useCabins";
import { useSettings } from "../settings/useSettings";
import { useCreateBooking } from "./useCreateBooking";
import { useGuests } from "./useGuests";
// import { useCreateCabin } from "./useCreateCabin";
// import { useUpdateCabin } from "./useUpdateCabin";

function CreateBookingForm({ cabinToEdit = {}, onCloseModal }) {
    const [idCabin, setIdCabin] = useState("");
    const [idGuest, setIdGuest] = useState("");
    const { id: editId, ...editValues } = cabinToEdit;
    const navigate = useNavigate();
    // const isEditSession = Boolean(editId);
    const isEditSession = false;
    function handleChangeIdCabins(e) {
        setIdCabin(e.target.value);
    }
    function handleChangeIdGuests(e) {
        setIdGuest(e.target.value);
    }
    // console.log(idCabin);
    //  Get Cabins
    const { cabins, isLoading: isLoadingCabins } = useCabins();
    // Get Guests
    const { guests, isLoadingGuests } = useGuests();
    // Get Settings
    const { settings, isLoadingSettings } = useSettings();
    const { createBooking, isCreatingBooking } = useCreateBooking();
    // console.log(guests);
    let optionsCabins;
    let optionsGuests;
    if (cabins) {
        optionsCabins = cabins?.map((cabin) => ({
            value: cabin.id,
            label: cabin.name,
        }));
    }
    if (guests) {
        optionsGuests = guests?.map((guest) => ({
            value: guest.id,
            label: guest.fullName,
        }));
    }
    // console.log(optionsGuests);

    let selectedCabinPrice = 0;
    let selectedCabinDiscount = 0;
    let selectedCabinTotalPrice = 0;

    if (!isLoadingCabins && cabins) {
        const selectedCabin = cabins.filter((cabin) => cabin.id === +idCabin);
        selectedCabinPrice = selectedCabin[0]?.regularPrice || 0;
        selectedCabinDiscount = selectedCabin[0]?.discount || 0;

        selectedCabinTotalPrice = selectedCabinPrice - selectedCabinDiscount;
    }

    const {
        register,
        handleSubmit,
        reset,
        setError,
        getValues,
        formState,
        setValue,
    } = useForm({
        defaultValues: isEditSession
            ? editValues
            : {
                  cabinPrice: 0,
              },
    });
    useEffect(() => {
        // Update the default value of cabinPrice whenever selectedCabinTotalPrice changes
        setValue("cabinPrice", selectedCabinTotalPrice);
    }, [selectedCabinTotalPrice, setValue]);
    const { errors } = formState;

    const validateStartDate = (value) => {
        const selectedDate = new Date(value);
        const currentDate = new Date();

        if (selectedDate < currentDate) {
            return false;
        }
        return true;
    };
    const validateEndDate = (value) => {
        const selectedDate = new Date(value);
        const currentDate = new Date();

        if (selectedDate < currentDate) {
            return false;
        }
        return true;
    };
    //Sumbit form function
    function onSubmit(data) {
        console.log(data);
        const numNights = differenceInDays(
            new Date(data.endDate),
            new Date(data.startDate)
        );
        if (numNights < 1) {
            toast.error("Start date must be before end date");
            return;
        }
        if (numNights < settings.minBookingLength) {
            toast.error(
                `Minimum nights per booking is ${settings.minBookingLength}`
            );
            return;
        }
        if (numNights > settings.maxBookingLength) {
            toast.error(
                `Maximum nights per booking is ${settings.maxBookingLength}`
            );
            return;
        }
        if (+data.numGuests > settings.maxGuestsPerBooking) {
            toast.error(
                `Maximum nights per booking is ${settings.maxGuestsPerBooking}`
            );
            return;
        }
        const extraPrice = data.hasBreakfast
            ? settings.breakfastPrice * data.numGuests
            : 0;
        const totalPrice = data.cabinPrice + extraPrice;
        const finalData = {
            startDate: data.startDate,
            endDate: data.endDate,
            numNights,
            numGuests: +data.numGuests,
            cabinPrice: data.cabinPrice * numNights,
            extraPrice,
            totalPrice,
            status: "unconfirmed",
            hasBreakfast: data.hasBreakfast,
            isPaid: data.isPaying,
            observations: data.observation,
            guestId: +data.guestId,
            cabinId: +data.cabinId,
        };
        console.log(finalData);
        createBooking(finalData, {
            onSuccess: () => {
                reset();
                onCloseModal?.();
            },
        });
    }

    return (
        <Form
            type={onCloseModal ? "modal" : "regular"}
            onSubmit={handleSubmit(onSubmit)}
        >
            <FormRow label="Start date" error={errors?.startDate?.message}>
                <Input
                    disabled=""
                    type="datetime-local"
                    id="startDate"
                    {...register("startDate", {
                        required: "this field is required",
                        validate: (value) =>
                            validateStartDate(value) ||
                            "Please select a future date",
                    })}
                />
            </FormRow>
            <FormRow label="End date" error={errors?.endDate?.message}>
                <Input
                    disabled=""
                    type="datetime-local"
                    id="endDate"
                    {...register("endDate", {
                        required: "this field is required",
                    })}
                />
            </FormRow>

            <FormRow
                label="Number of Guests"
                error={errors?.numGuests?.message}
            >
                <Input
                    disabled=""
                    type="number"
                    id="numGuests"
                    {...register("numGuests", {
                        required: "This field is required",
                    })}
                />
            </FormRow>
            {cabins && (
                <FormRow label="Select cabin">
                    <Select
                        options={optionsCabins}
                        register={{ ...register("cabinId") }}
                        onChange={handleChangeIdCabins}
                        value={idCabin}
                    />
                </FormRow>
            )}
            {guests && (
                <FormRow label="Select guest">
                    <Select
                        options={optionsGuests}
                        register={{ ...register("guestId") }}
                        onChange={handleChangeIdGuests}
                        value={idGuest}
                    />
                </FormRow>
            )}
            <FormRow
                label={`Cabin Price (per day) ${
                    selectedCabinDiscount
                        ? `with discount ${selectedCabinDiscount}`
                        : ""
                }`}
                error={errors?.cabinPrice?.message}
            >
                <Input
                    disabled
                    type="number"
                    id="cabinPrice"
                    {...register("cabinPrice", {
                        required: "This field is required",
                    })}
                />
            </FormRow>

            <FormRow label="Observations" error={errors?.observation?.message}>
                <Textarea
                    disabled=""
                    type="text"
                    id="observation"
                    defaultValue=""
                    {...register("observation", {
                        required: "This field is required",
                    })}
                />
            </FormRow>
            <FormRow>
                <Checkbox
                    id="hasBreakfast"
                    register={{
                        ...register("hasBreakfast"),
                    }}
                >
                    Do you want breakfast?
                </Checkbox>
            </FormRow>
            <FormRow>
                <Checkbox
                    id="isPaying"
                    register={{
                        ...register("isPaying"),
                    }}
                >
                    Are you paying?
                </Checkbox>
            </FormRow>

            {/* 
            <FormRow
                label="Description for website"
                error={errors?.description?.message}
            >
                <Textarea
                    disabled=""
                    type="number"
                    id="description"
                    defaultValue=""
                    {...register("description", {
                        required: "This field is required",
                    })}
                />
            </FormRow>

            <FormRow label="Cabin photo" error={errors?.image?.message}>
                <FileInput
                    id="image"
                    accept="image/*"
                    {...register("image", {
                        required: isEditSession
                            ? false
                            : "This field is required",
                    })}
                />
            </FormRow> */}

            <FormRow>
                {/* type is an HTML attribute! */}
                <Button
                    variation="secondary"
                    type="reset"
                    onClick={() => onCloseModal?.()}
                >
                    Cancel
                </Button>
                <Button disabled="">
                    {isEditSession ? "Edit cabin" : "Create new cabin"}
                </Button>
            </FormRow>
        </Form>
    );
}

export default CreateBookingForm;
