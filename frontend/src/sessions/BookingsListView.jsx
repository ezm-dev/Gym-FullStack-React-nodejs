import {useNavigate,useLocation} from "react-router" 
import { useCallback, useEffect, useState } from "react"
import { fetchAPI } from "../api.mjs"
import validator from "validator"
import { useAuthenticate } from "../authentication/useAuthenticate"

function BookingsListView(){
   const {search} = useLocation()
   const queryParams = new URLSearchParams(search)
   const activity = queryParams.get('activity')
   const date = new Date(queryParams.get('date')).toLocaleDateString("en-CA")

   const navigate = useNavigate()
   //inputs state

   const {user}=useAuthenticate(["member"])
    const [sessionId,setSessionId] =useState(null) //selected sesission
    const bookingDate = new Date().toLocaleDateString("en-CA")

    const [sessions, setSessions] = useState(null)
    const [bookingStatus, setBookingStatus] = useState(null)
    const [status, setStatus] = useState(null)
    const [loading,setLoading] = useState(false)
    const [booked,setBooked] =useState(false)//check if booked before

    
 


    useEffect(()=>{
    if(activity && date){
      fetchAPI("GET","/sessions/calendar?select_date="+date+"&select_activity="+activity,null,user.authenticationKey)
          .then(response=>{
              if(response.status ==200){
                  setSessions(response.body)
                  console.log(response.body)
                  setStatus(null)
              }else{
                  setStatus(response.body.message)//serverside error
                  console.log(response.body.message)
              }
          }).catch(error=>{
              setStatus(error) //client side errors if fetch fails
          })
              
          }
    },[activity, date, setSessions,setStatus])

  
  //create booking
  const submitForm = useCallback(() => {
  setBookingStatus(null)
  setLoading(true);

  // : Check existing bookings,get bookings for this user
  fetchAPI("GET","/bookings?id="+parseInt(user.id), null, user.authenticationKey)
    .then(response => {
      if (response.status == 200) {
        const userBookings = response.body;
       console.log(userBookings ) //undefined????????????????

      const alreadyBooked = userBookings.some(result => 
          parseInt(result.session.id) == parseInt(sessionId)
        )


        // Check if this session was already booked by the user
       // const alreadyBooked = results.some(result => result.session.sessionId === parseInt(sessionId))
        if(alreadyBooked){
          setBooked(true);
          setBookingStatus("You already booked this session! Please select another one.");
          setLoading(false);
          return // Stop here 
        }
      
        // Create Booking
        fetchAPI("POST", "/bookings", {
          userId: user.id,
          sessionId: parseInt(sessionId),
          bookingDate: bookingDate
        }, user.authenticationKey)
          .then(response2 => {
            if (response2.status === 200) {
              setBookingStatus("Thank you! Your booking is created.")
            } else {
              setBookingStatus("Failed to create booking - " + response2.body.message)
            }
            setLoading(false);
          })
          .catch(error => {
            setBookingStatus("Failed to create booking - " + error);
            setLoading(false);
          })

      } else {
        setBookingStatus("Failed to check existing bookings - " + response.body.message)
        setLoading(false);
      }
    })
    .catch(error => {
      setBookingStatus("Failed to check existing bookings - " + error);
      setLoading(false);
    })

}, [setLoading, setBookingStatus,setBooked,sessionId, user, bookingDate]);
 


    return <section className="flex flex-col items-center gap-4 p-4"> 
    <h1 className="text-2xl">Booking Details</h1>
      <h2>{activity} {date}</h2>
       {!status && !sessions && <span className="loading loading-spinner loading-xl"></span> }
        {status&&<span>{status}</span>}
        {!status && sessions && <>     
        
        <select 
          onChange={(e) => {setSessionId(e.target.value)
            setBookingStatus(null)
             setBooked(false)

          }}
          defaultValue="Pick a session" 
          className="select select-neutral w-full ">
          <option disabled>Pick a session</option>
          {sessions.map((s, index) => {
            const location = s.location.name
            const startTime = s.session.startTime
            const trainerName = `${s.user.firstName} ${s.user.lastName}`
            return (
              <option key={index} value={s.session.id} className="text-lg" >
                {location} - {startTime} - {trainerName}
              </option>
            );
          })}
        </select>
    
        <button
         disabled={loading || !sessionId ||!user||booked} //{loading == true}
         onClick={()=>submitForm()} 
         className="btn btn-outline btn-xl self-stretch">
         Book{loading && <span className="loading loading-spinner loading-sm"></span>}
        </button>
        {bookingStatus &&<span>{bookingStatus}</span>}
        </>}
  </section>
     
}

export default BookingsListView