import { Fragment, useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router";
import { CgGym } from "react-icons/cg";
import { fetchAPI } from "../api.mjs"
import { useAuthenticate } from "../authentication/useAuthenticate";


function SessionsListView(){
    const [sessionsCalendarByDay, setSessionsCalendarByDay] = useState({})
    const [error, setError] = useState(null)
    ////Set buton status to disable if the date is not
    const {user}=useAuthenticate(["member"]) 
    const navigate = useNavigate()
   

    const getSessionsCalendar = useCallback(() => {
        const today = new Date()
        const sundayOfThisWeek = new Date()
        sundayOfThisWeek.setDate(today.getDate() - today.getDay())
        const startDate = toLocaleDateString(sundayOfThisWeek)
      // const startDate = sundayOfThisWeek.toLocaleDateString("en-CA")

        const saturdayOfThisWeek = new Date(sundayOfThisWeek)
        saturdayOfThisWeek.setDate(sundayOfThisWeek.getDate()+6)//+6
        const endDate = toLocaleDateString(saturdayOfThisWeek)
      //  const endDate = saturdayOfThisWeek.toLocaleDateString("en-CA")

        fetchAPI("GET", `/sessions/calendar?start_date=${startDate}&end_date=${endDate}`,null,user.authenticationKey)
            .then(response => {
                if (response.status === 200) {
                    if (response.body.length > 0) {
                        setSessionsCalendarByDay(partitionByDay(response.body))
                        setError(null)
                    } else {
                        setSessionsCalendarByDay({})
                        setError("No results")
                    }
                } else {
                    setError(response.body.message)
                }
            })
            .catch(error => {
                setError(error)
            })
    }, [user,setSessionsCalendarByDay,setError])

    useEffect(() => {
        if(user){
        getSessionsCalendar()
        }
    }, [user,getSessionsCalendar])

    return (
        <section className="flex flex-col items-center">
            {error && <span className="p-4 self-center">{error}</span>}
            {!error && Object.entries(sessionsCalendarByDay).length == 0
                ? <span className="loading loading-spinner loading-xl block m-4"></span>
                : <ul className="list bg-base-100 self-stretch">
                    {Object.entries(sessionsCalendarByDay).map(([day, sessions]) => { 
                       // Group by activity name for this day
                        const activityMap = new Map()
                        for (const session of sessions) {
                            const activityName = session.activity.name
                            if (!activityMap.has(activityName)) {
                                activityMap.set(activityName, session) // store one session for this activity
                            }
                        }
                        return (
                            <Fragment key={day}>
                                <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">{day}</li>
                                { [...activityMap.entries()].map(([activityName, session]) => (
                                    <li key={activityName} className="list-row">
                                        <div><CgGym className="size-10" /></div>
                                        <div>
                                            <div className="text-xl">{activityName}</div>
                                            <div className="text-xs uppercase opacity-60 font-semibold">
                                                {/* {toLocaleDateString(new Date(session.session.date))} - {session.session.startTime} - {session.user.firstName} {session.user.lastName} */}
                                            </div>
                                        </div>
                                        <button           
                                            onClick={() => navigate(`/bookings?activity=${session.activity.name}&date=${session.session.date}`)}
                                            className="btn btn-ghost text-xl"
                                            //disable if session's date before or equal to today's date
                                            disabled={new Date(session.session.date) <= new Date(new Date().toLocaleDateString("en-CA"))} 
                                        >
                                            Book
                                        </button>
                                    </li>
                                ))}
                            </Fragment>
                        )
                    })}
                </ul>
            }
        </section>
    )
}

function toLocaleDateString(date) {
    const year = date.toLocaleString('en-AU', { year: 'numeric' });
    const month = date.toLocaleString('en-AU', { month: '2-digit' })
    const day = date.toLocaleString('en-AU', { day: '2-digit' });
    return [year, month, day].join('-');
}

function partitionByDay(sessionsCalendar) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayPartitions = {
        "Sunday": [], "Monday": [], "Tuesday": [], "Wednesday": [],
        "Thursday": [], "Friday": [], "Saturday": []
    }

    for (const sessionCalendar of sessionsCalendar) {
        const dayOfSessionCalendar = daysOfWeek[new Date(sessionCalendar.session.date).getDay()]
        dayPartitions[dayOfSessionCalendar].push(sessionCalendar)
    }

    return dayPartitions
}

export default SessionsListView
