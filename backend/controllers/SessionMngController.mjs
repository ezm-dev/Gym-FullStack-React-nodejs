import express from "express"
import bcrypt from "bcryptjs"
import { AuthenticationController } from "./AuthenicationController.mjs"
import validator from "validator"
import { SessionALTModel } from "../models/SessionALTModel.mjs"
import { SessionModel } from "../models/SessionModel.mjs"
import { ActivityModel } from "../models/ActivityModel.mjs"
import { LocationModel } from "../models/LocationModel.mjs"
import { UserModel } from "../models/UserModel.mjs"


/**
 * SessionMng Controller handels sessions CRUDS
 */

export class SessionMngController {
    static routes = express.Router()
    /**
    * The routes defined by SessionMngController
    */
    static {
        
        
        this.routes.get("/", AuthenticationController.restrict(["admin"]), this.viewSessionManagment)//get the page with from empty
        this.routes.get("/:id", AuthenticationController.restrict(["admin"]), this.viewSessionManagment)//get the page with specific id

        this.routes.post("/", AuthenticationController.restrict(["admin"]), this.handleSessionManagement)// create
        this.routes.post("/:id", AuthenticationController.restrict(["admin"]), this.handleSessionManagement)//recieve del,update
    }


    /**
     * 
     * This endpoint handels GET-ting and displaying the Session CRUD page
     *  @type {express.RequestHandler}
     */
    static async viewSessionManagment(req, res) {  //handle filters
        //show empty form  or filled with one data

        const selectedSessionId = req.params.id

        //if filter by dates
        //startDate=&endDate=&find=Go -----------------------------
        if ((req.query.startDate || req.query.endDate) && req.query.find == "Go") {
            // if(req.query.startDate && req.query.endDate && req.query.find =="Go"){

            //validation on input dates
            // console.log("filterby  dates")
            const startDate = new Date(req.query.startDate).toLocaleDateString("en-CA")
            const endDate = new Date(req.query.endDate).toLocaleDateString("en-CA")
            //console.log(startDate)
            // console.log(endDate)


            if (!validator.isDate(startDate, { format: "YYYY-MM-DD", strictMode: true })) {
                res.status(400).render("status.ejs", {
                    status: "Invalid input provided",
                    message: "Please enter a valid date format, please use this format (YYYY-MM-DD)"
                })
                return

            }
            if (!validator.isDate(endDate, { format: "YYYY-MM-DD", strictMode: true })) {
                res.status(400).render("status.ejs", {
                    status: "Invalid input provided",
                    message: "Please enter a valid date format, please use this format (YYYY-MM-DD)"
                })
                return

            }

            //check end date >  start date
            const sessions = await SessionALTModel.getSessionBetweenDates(startDate, endDate)
            //sconsole.log(sessions)
            const activities = await ActivityModel.getAll()
            const locations = await LocationModel.getAll()
            const trainers = await UserModel.getByRole("trainer")
            const selectedSession = sessions.find(s => s.session.id == selectedSessionId) ?? new SessionALTModel("", "", "", "")
            res.render("session_mng.ejs", { sessions, activities, locations, trainers, selectedSession, authenticatedUser: req.authenticatedUser, selectedTrainerId: null })
            return

        } else if (req.query.byTrainer && req.query.filter == "Go") {
            //validate input select trainer
            UserModel.getByRole("trainer")
                .then(trainers => {
                    const check = trainers.some(t => t.id == req.query.byTrainer)
                    if (!check) {
                        res.status(400).render("status.ejs", {
                            status: "Invalid input provided",
                            message: "Trainer  is invalid, please select a valid trainer."
                        })
                        return
                    }
                }).catch(error => {
                    console.log(error)
                    res.status(500).render("status.ejs", {
                        status: "Database Error",
                        message: "Can not the list of trainers."
                    })
                    return
                })

            const sessions = await SessionALTModel.getSessionsByTrainerId(req.query.byTrainer)
            const activities = await ActivityModel.getAll()
            const locations = await LocationModel.getAll()
            const trainers = await UserModel.getByRole("trainer")
            //  const sessionOnly = await SessionModel.getAll()
            // console.log (trainers)

            //search the list of all users for the user matching the selectedUserIdpassed in the url params
            //?? if the thing on left null --- use the right (find user / make a new one)
            const selectedSession = sessions.find(s => s.session.id == selectedSessionId) ?? new SessionALTModel("", "", "", "")
            //   const selectedSessionOnly = sessionOnly.find(s=> s.id ==  selectedSessionId) ?? new SessionModel(null,"","","","","","")

            res.render("session_mng.ejs", { sessions, activities, locations, trainers, selectedSession, authenticatedUser: req.authenticatedUser, selectedTrainerId: req.query.byTrainer })

            return

        }


        else { //get All without filter
            const sessions = await SessionALTModel.getAll()
            const activities = await ActivityModel.getAll()
            const locations = await LocationModel.getAll()
            const trainers = await UserModel.getByRole("trainer")
            //  const sessionOnly = await SessionModel.getAll()
            // console.log (trainers)

            //search the list of all users for the user matching the selectedUserIdpassed in the url params
            //?? if the thing on left null --- use the right (find user / make a new one)
            const selectedSession = sessions.find(s => s.session.id == selectedSessionId) ?? new SessionALTModel("", "", "", "")
            //   const selectedSessionOnly = sessionOnly.find(s=> s.id ==  selectedSessionId) ?? new SessionModel(null,"","","","","","")
            res.render("session_mng.ejs", { sessions, activities, locations, trainers, selectedSession, authenticatedUser: req.authenticatedUser, selectedTrainerId: null })
            return

        }


    }
    /**
     * 
     * This endpoint handles for POSTs for the various CRUD operations on the edit form.
     *  @type {express.RequestHandler}
     */

    static handleSessionManagement(req, res) {

        const selectedSessionId = req.params.id //id
        const formData = req.body  //data sent from form
        const action = formData.action  //action
        //Validation// 
        //id
        if (selectedSessionId) {
            SessionALTModel.getById(selectedSessionId)
                .then(result => {
                    if (!result) {
                        res.status(400).render("status.ejs", {
                            status: "Invalid input provided",
                            message: "Session id is invalid or deleted, please select a valid session"
                        })
                        return

                    }

                }).catch(error => {
                    console.log(error)
                })

        }


        //activity
        formData.formActivity
        ActivityModel.getAll()
            .then(activities => {
                const check = activities.some(a => a.id == formData.formActivity)
                if (!check) {
                    console.log("check activity", check)
                    res.status(400).render("status.ejs", {
                        status: "Invalid input provided",
                        message: "Activity name is invalid, please select a valid activity."
                    })
                    return
                }

            }).catch(error => {
                console.log(error)
            })




        //location
        LocationModel.getAll()
            .then(locations => {
                const check = locations.some(l => l.id == formData.formLocation)
                if (!check) {
                    //console.log("check loc",check)
                    res.status(400).render("status.ejs", {
                        status: "Invalid input provided",
                        message: "Location is invalid, please select a valid location."
                    })
                    return
                }
            }).catch(error => {
                console.log(error)
            })




        //trainer
        UserModel.getByRole("trainer")
            .then(trainers => {
                const check = trainers.some(t => t.id == formData.formTrainer)
                if (!check) {
                    res.status(400).render("status.ejs", {
                        status: "Invalid input provided",
                        message: "Trainer  is invalid, please select a valid trainer."
                    })
                    return
                }
            }).catch(error => {
                console.log(error)
            })


        //date
        if (!validator.isDate(formData.date, { format: "YYYY-MM-DD", strictMode: true })) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "Please enter a valid date format, please use this format (YYYY-MM-DD)"
            })
            return

        }


        //startTime
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
        //const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;// hh:ss only

        if (!validator.matches(formData.startTime, timeRegex)) {

            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a valid time format (hh:mm)"
            })
            return

        }

        //duration
        if (!validator.isInt(formData.duration, { min: 30, max: 90 })) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a valid duration in mins: e.g. 30, 45, 60, 90 (min: 30, max: 90)"
            })
            return

        }


        const session = new SessionModel(selectedSessionId, formData.formActivity, formData.formTrainer, formData.formLocation, formData.date, formData.startTime, formData.duration)

        if (action == "create") {
            SessionModel.create(session)
                .then(result => {
                    res.redirect("/session_mng")
                }).catch(error => {
                    console.error(error)
                    res.status(500).render("status.ejs", {
                        status: "Database error",
                        message: "The session could not be created."
                    })
                })

        } else if (action == "update") {

            SessionModel.update(session)
                .then(result => {
                    if (result.affectedRows > 0) {
                        res.redirect("/session_mng")
                    }
                    else {
                        res.status(500).render("status.ejs", { //no uderid  or deleted 404
                            status: "Session update error",
                            message: "The session could not be found ."
                        })
                    }
                })
                .catch(error => {
                    console.error(error)
                    res.status(500).render("status.ejs", {
                        status: "Database error",
                        message: "The session could not be updated."
                    })
                })

        } else if (action == "delete") {
            SessionModel.delete(selectedSessionId)
                .then(result => {
                    if (result.affectedRows > 0) {
                        res.redirect("/session_mng")
                    } else {
                        res.status(500).render("status.ejs", {
                            status: "Session delete error",
                            message: "The session could not be found ."
                        })

                    }

                })
                .catch(error => {

                    console.error(error)
                    res.status(500).render("status.ejs", {
                        status: "Database error",
                        message: "The session could not be deleted."
                    })

                })

        } else {


            res.status(500).render("status.ejs", {
                status: "Invalid action",
                message: "This form doesn't support this action."
            })

        }

    }

}