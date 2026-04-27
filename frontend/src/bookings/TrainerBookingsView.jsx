import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchAPI } from "../api.mjs";
import { useAuthenticate } from "../authentication/useAuthenticate";
import BookingsList from "../common/BookingsList";
import XMLDownloadButton from "../common/XMLDownloadButton";

function TrainerBookingsView() {
    const [bookings, setBookings] = useState(null);
    const [status, setStatus] = useState(null);
    const { user } = useAuthenticate(["trainer"]);
    const navigate = useNavigate();

    // const deleteBooking = useCallback((id) => {
    //     fetchAPI("DELETE", "/bookings/" + id, null, user.authenticationKey)
    //         .then(response => {
    //             if (response.status === 200) {
    //                 setBookings(prev => prev.filter(b => b.booking.id !== id));
    //             } else {
    //                 console.error("Failed to delete: " + response.body.message);
    //             }
    //         })
    //         .catch(error => console.error("Delete error:" + error));
    // }, [user]);

    const getBookings = useCallback(() => {
        fetchAPI("GET", "/sessions?id=" + user.id, null, user.authenticationKey)
            .then(response => {
                if (response.status === 200) {
                    setBookings(response.body);
                    setStatus(null);
                } else {
                    setStatus(response.body.message);
                }
            })
            .catch(error => setStatus(error));
    }, [user]);

    useEffect(() => {
        if (user) getBookings();
    }, [user, getBookings]);

    return (
        <section className="flex flex-col items-center gap-4 p-4">
            <h1 className="text-2xl">My Bookings</h1>
            {user
            ?<XMLDownloadButton 
                route="/xml/sessions" 
                filename="sessions.xml"   
                authenticationKey={user.authenticationKey}
                className="btn btn-warning">Export Bookings</XMLDownloadButton>
            :<span className="loading loading-spinner loading-md"></span>}
            {!status && !bookings && <span className="loading loading-spinner loading-xl"></span>}
            {status && <span className="self-center">{status}</span>}
            {!status && bookings &&
                <BookingsList bookings={bookings} showDelete={false}  />
            }
        </section>
    );
}

export default TrainerBookingsView;