import { FaTimes } from "react-icons/fa";

export default function BookingsList({ bookings, showDelete = false, onDelete }) {
    if (!bookings) return null;

    return (
        <div className="w-full self-stretch">
            {bookings.map((b) => (
                <div key={b.session.id} className="card w-full self-stretch bg-base-200 shadow-sm mb-5 space-y-1">
                    <div className="card-body p-2">
                        <div className="card-actions justify-end">
                            {showDelete && (
                                <button
                                    onClick={() => onDelete?.(b.booking.id)}
                                    className="btn btn-square btn-sm text-red-600 font-bold"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                        <p className="text-xl font-bold">{b.activity.name}</p>
                        <p><span className="font-semibold">Location: </span>{b.location.name}</p>
                        <p><span className="font-semibold">Trainer: </span>{b.user ? `${b.user.firstName} ${b.user.lastName}` : ""}</p>
                        <p><span className="font-semibold">Date: </span>{new Date(b.session.date).toLocaleDateString()} - {b.session.startTime}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}