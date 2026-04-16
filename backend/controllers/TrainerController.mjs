import express from "express"
import bcrypt from "bcryptjs"
import { UserModel } from "../models/UserModel.mjs"
import { AuthenticationController } from "./AuthenicationController.mjs"
import validator from "validator"
import { SessionALTModel } from "../models/SessionALTModel.mjs"
import { LocationModel } from "../models/LocationModel.mjs"
import { ActivityModel } from "../models/ActivityModel.mjs"
import { SessionModel } from "../models/SessionModel.mjs"
import { BookingModel } from "../models/BookingModel.mjs"


/**
 * Trainer Controller handels trainer functionalities
 */

export class TrainerController {
    static routes = express.Router()
    /**
    * The routes defined by TrainerController
    */
    static {
       

        this.routes.get("/", AuthenticationController.restrict(["trainer"]), this.viewTrainerSessions)//get the page with from empty
        this.routes.post("/", AuthenticationController.restrict(["trainer"]), this.createSession)// create
        this.routes.get("/:id", AuthenticationController.restrict(["trainer"]), this.deleteSession)//recieve del,update
    }


    /**
     * 
     * This endpoint handels GET-ting and displaying the trainer session list
     *  @type {express.RequestHandler}
     * 
     */
    static async viewTrainerSessions(req, res) {

        const authenticatedUser = req.authenticatedUser
        try {
            const sessions = await SessionALTModel.getSessionsByTrainerId(authenticatedUser.id)
            const locations = await LocationModel.getAll()
            const activities = await ActivityModel.getAll()

            res.render("trainer.ejs", { sessions, locations, activities, authenticatedUser })
        } catch (error) {
            console.log(error)
        }


    }
    /**
     * This endpoint handels deleting session
     *  @type {express.RequestHandler}
     */
    static async deleteSession(req, res) {
        const sessionId = req.params.id
        try {
            //delete bookings of this session, before delete the session
            const result2 = await BookingModel.deleteBookingsBySessionId(sessionId)
            // console.log(result2, "deleted")
            const result = await SessionModel.delete(sessionId)
            //delete bookings for this session



            if (result.affectedRows > 0) {
                res.redirect("/trainer")
            } else {
                res.status(400).render("status.ejs", {
                    status: "Session delete error",
                    message: "The session could not be deleted, maybe the id is invalid."
                })

            }


        } catch (error) {
            console.log(error.message)
            res.status(500).render("status.ejs", {
                status: "Database error",
                message: "The session could not be deleted."
            })
        }


    }
    /**
     * This endpoint handels creating a trainer session 
     *  @type {express.RequestHandler}
     */

    static async createSession(req, res) {
        const formData = req.body

        const today = new Date();
        const selectedDate = new Date(formData.date);

        if (!validator.isDate(formData.date, { format: "YYYY-MM-DD", strictMode: true })) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "Please enter a valid date format, please use this format (YYYY-MM-DD)"
            })
            return

        }

        if (selectedDate <= today) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a valid date after today"
            })
            return

        }
        //time
        // const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

        if (!validator.matches(formData.startTime, timeRegex)) {

            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a valid time format (hh:mm)"
            })
            return

        }

        if (!validator.isInt(formData.duration, { min: 30, max: 90 })) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a valid duration in mins: e.g. 30, 45, 60, 90 (min: 30, max: 90)"
            })
            return

        }

        try {
            const authenticatedUser = req.authenticatedUser
            //get sessions for this trainer
            const sessions = await SessionALTModel.getSessionsByTrainerId(authenticatedUser.id)

            //compare date and time to check if he has sessions at the same time
            const selectedDate = new Date(formData.date).toLocaleDateString("en-CA")
            // console.log("Form Date",selectedDate)

            if (sessions.length > 0) {
                for (let result of sessions) {

                    let sessionDate = new Date(result.session.date).toLocaleDateString("en-CA")
                    // console.log("session",sessionDate)

                    //if same time
                    if (sessionDate == selectedDate && result.session.startTime == formData.startTime + ":00") {

                        //  console.log(result.session.startTime)
                        //  console.log(formData.startTime)
                        res.render("status.ejs", {
                            status: "Invalid session creation",
                            message: " You cannot create this session because you already have one  at the same time."

                        })
                        return

                    }


                }//end for 

            }
            //const date =  DatabaseModel.toMySqlDate(selected.session.date)
            const session = new SessionModel(null, formData.activity, req.authenticatedUser.id,
                formData.location, formData.date, formData.startTime, formData.duration)
            SessionModel.create(session)
                .then(Sessionresult => {
                    res.redirect("/trainer")

                }).catch(error => {
                    res.status(400).render("status.ejs", {
                        status: "Invalid session details",
                        message: "The session is invalid and could not be created."

                    })

                    return
                })



        } catch (error) {
            console.error(error.message)
            res.status(500).render("status.ejs", {
                status: "Database error",
                message: "The session could not be created. "
            })

        }


    }


}