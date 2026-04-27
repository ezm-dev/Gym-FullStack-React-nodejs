import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { fetchAPI } from "../api.mjs"
import { useAuthenticate } from "../authentication/useAuthenticate"
import XMLDownloadButton from "../common/XMLDownloadButton"

function MemberBookingsView() {
  
    const [bookings, setBookings] = useState(null)
    const [status, setStatus] = useState(null)
    const navigate = useNavigate()
    const {user}=useAuthenticate(["member"]) 

    const  deleteBooking = useCallback((id)=>{
        fetchAPI("DELETE","/bookings/"+id,null,user.authenticationKey)
        .then(response => {
          if (response.status === 200) {
        
            setBookings((prevBookings) => prevBookings.filter((b) => b.booking.id !== id))
          } else {
            console.error("Failed to delete: "+response.body.message);
          }
        })
        .catch(error => {
          console.error("Delete error:"+error);
        })
        },[user,setBookings]
    )
    const getBookings = useCallback(()=>{
           
            fetchAPI("GET", "/bookings?id="+user.id,null,user.authenticationKey)
                .then(response => {
                    if (response.status == 200) {
                        setBookings(response.body)
                        console.log(response.body)
                        setStatus(null)
                    } else {
                        setStatus(response.body.message)
                    }
                })
                .catch(error => {
                    setStatus(error)
                })
        

    },[user,setBookings,setStatus])

    useEffect(() => {
         if(user){
        getBookings()
        }

    }, [user, getBookings])

    return <section className="flex flex-col items-center gap-4 p-4">
        <h1 className="text-2xl">My Bookings</h1>
        {user?<XMLDownloadButton 
            route="/xml/bookings" 
            filename="bookings.xml"   
            authenticationKey={user.authenticationKey}
            className="btn btn-warning">Export Bookings</XMLDownloadButton>:<span className="loading loading-spinner loading-md"></span>}
        {!status && !bookings && <span className="loading loading-spinner loading-xl"></span>}
        {status && <span className="self-center">{status}</span>}
        {!status && bookings
            && <div className="w-full self-stretch">
            {bookings.map((b) => (
            <div key={b.session.id} className="card w-full self-stretch bg-base-200 shadow-sm mb-5 space-y-1">  
            <div className="card-body p-2">
                <div className="card-actions justify-end">
                {user  &&<button 
                onClick={()=>deleteBooking(b.booking.id)}
                className="btn btn-square btn-sm text-red-600 font-bold bg-base-300">X
                </button>}
                </div>
                <p className="text-xl font-bold">{b.activity.name}</p>
                <p><span className="font-semibold">Location: </span>{b.location.name}  </p>
                <p><span className="font-semibold">Trainer: </span>{b.user?`${b.user.firstName} ${b.user.lastName}`:""} </p>
                <p><span className="font-semibold">Date: </span>{new Date(b.session.date).toLocaleDateString()} - {b.session.startTime} </p>
            </div>
            </div>
       ))} 
                            
            </div>
        }
    </section>
}

export default MemberBookingsView