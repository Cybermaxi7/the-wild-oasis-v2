import Button from "../../ui/Button";
import ConfirmDelete from "../../ui/ConfirmDelete";
import Empty from "../../ui/Empty";
import Menus from "../../ui/Menus";
import Modal from "../../ui/Modal";
import Pagination from "../../ui/Pagination";
import Spinner from "../../ui/Spinner";
import Table from "../../ui/Table";
import CreateCabinForm from "../cabins/CreateCabinForm";
import BookingRow from "./BookingRow";
import CreateBookingForm from "./CreateBookingForm";
import { useBookings } from "./useBookings";

function BookingTable() {
    const { bookings, isLoading, count } = useBookings();
    if (isLoading) return <Spinner />;
    if (!bookings?.length) return <Empty resourceName="bookings" />;

    return (
        <Menus>
            <Table columns="0.6fr 2fr 2.4fr 1.4fr 1fr 3.2rem">
                <Table.Header>
                    <div>Cabin</div>
                    <div>Guest</div>
                    <div>Dates</div>
                    <div>Status</div>
                    <div>Amount</div>
                    <div></div>
                </Table.Header>

                <Table.Body
                    data={bookings}
                    render={(booking) => (
                        <BookingRow key={booking.id} booking={booking} />
                    )}
                />
                <Table.Footer>
                    <Pagination count={count} />
                </Table.Footer>
            </Table>
            <Modal>
                <Modal.Open opens="create-bookings">
                    <Button>Create Bookings</Button>
                </Modal.Open>
                <Modal.Window name="create-bookings">
                    <CreateBookingForm />
                </Modal.Window>
            </Modal>
            
        </Menus>
    );
}

export default BookingTable;
