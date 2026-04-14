import express from "express"
import { ActivityModel } from "../models/ActivityModel.mjs"
import { SessionALTModel } from "../models/SessionALTModel.mjs"
import { SessionModel } from "../models/SessionModel.mjs"
import { SessionActivityModel } from "../models/SessionActivityModel.mjs"
import { DatabaseModel } from "../models/DatabaseModel.mjs"
import { AuthenticationController } from "./AuthenicationController.mjs"
import validator from "validator"



/**
 * Session Controller handels viewing session calendar and sessions functionalities 
 */
export class SessionController {
    static routes = express.Router()

/**
 * The routes defined by SessionController
 */
    static {
        

        this.routes.get("/", AuthenticationController.restrict(["member"]), this.viewSessionListGroup)
        this.routes.post("/session", AuthenticationController.restrict(["member"]), this.viewSessionDetails)

    }

   /**
    * 
    * This endpoint handles viewing the sessions calendar 
    *  @type {express.RequestHandler}
    */

    static viewSessionListGroup(req, res) {
        //getDay Sunday - Saturday : 0 - 6
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const today = new Date()

        //Calculate the date of the start of the current week(Monday of this week)
        const sundayOfThisWeek = new Date()
        sundayOfThisWeek.setDate(today.getDate() - (today.getDay()))

        //Caculate the date of the end of the current week (sunday of this week)
        const saturdayOfThisWeek = new Date(sundayOfThisWeek)
        saturdayOfThisWeek.setDate(sundayOfThisWeek.getDate() + 6)
        //   console.log(today)
        //   console.log(sundayOfThisWeek)
        //    console.log(saturdayOfThisWeek)
        const sessionsByDay = {
            "Sunday": [],
            "Monday": [],
            "Tuesday": [],
            "Wednesday": [],
            "Thursday": [],
            "Friday": [],
            "Saturday": []
        }

        //SessionALTModel.getByStartAndEndDate(sundayOfThisWeek,saturdayOfThisWeek)
        SessionActivityModel.getActivityByDate(sundayOfThisWeek, saturdayOfThisWeek)
            .then(sessions => {
                // console.log(sessions)
                for (const session of sessions) {
                    const sessionDayName = daysOfWeek[session.session.date.getDay()] //Mon/Tues

                    sessionsByDay[sessionDayName].push(session)

                }
                res.render("sessions_list.ejs", { sessionsByDay, authenticatedUser: req.authenticatedUser })
                // console.log(sessionsByDay)
                // {users, selectedUser, authenticatedUser: req.authenticatedUser}

            }).catch(error => {
                console.log(error)
                res.status(400).render("status.ejs", {
                    status: "Session Details not found",
                    message: "Maybe the session is deleted or invalid"

                })
            })

    }
    /**
     * This endpoint handles viewing the session details
     * @type {express.RequestHandler}
     */
    static viewSessionDetails(req, res) {
        const authenticatedUser = req.authenticatedUser
        // const date = req.body.sessionDate
        // const activity = req.body.activityName

        const date = req.body.sessionDate.toLocaleString()
        const Senddate = new Date(date)
        const activity = req.body.activityName

        //console.log(activity,Senddate)

        const selectedDate = DatabaseModel.toMySqlDate(Senddate)

        SessionALTModel.getByDateAndActivity(Senddate, activity)
            .then(sessions => {
                //console.log(activity,selected.session.date)// 2025-02-23T14:00:00.000Z
                //console.log(selectedDate)//2025-02-24
                res.render("sessions_details.ejs", { sessions, activity, selectedDate, authenticatedUser: req.authenticatedUser })

            })
            .catch(error => {
                console.log(error)
                res.status(400).render("status.ejs", {
                    status: "Session Details not found",
                    message: "Maybe the session is deleted or invalid"

                })
            })


    }






}
