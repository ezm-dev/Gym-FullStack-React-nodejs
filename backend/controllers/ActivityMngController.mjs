import express from "express"
import bcrypt from "bcryptjs"
import { UserModel } from "../models/UserModel.mjs"
import { AuthenticationController } from "./AuthenicationController.mjs"
import validator from "validator"
import { LocationModel } from "../models/LocationModel.mjs"
import { ActivityModel } from "../models/ActivityModel.mjs"



/**
 * Activity Managment Controller for activities CRUD 
 */
export class ActivityMngController {
    static routes = express.Router()
      /**
     * The routes defined by ActivityController
     */
    static {
        //setup routes here

        this.routes.get("/", AuthenticationController.restrict(["admin"]), this.viewActivityManagement)//get the page with from empty
        this.routes.get("/:id", AuthenticationController.restrict(["admin"]), this.viewActivityManagement)//get the page with specific id

        this.routes.post("/", AuthenticationController.restrict(["admin"]), this.handleActivityManagement)// create
        this.routes.post("/:id", AuthenticationController.restrict(["admin"]), this.handleActivityManagement)//recieve del,update
    }


    /**
     * 
     * This endpoint handels GET-ting and displaying the activity CRUD page
     *  @type {express.RequestHandler}
     * 
     */
    static viewActivityManagement(req, res) {
        //show empty form  or filled with one data
        const selectedActivityId = req.params.id


        //show list of data for eithercreate/update
        ActivityModel.getAll()
            .then(activities => {
                //search the list of all users for the user matching the selectedUserIdpassed in the url params
                //?? if the thing on left null --- use the right (find user / make a new one)
                const selectedActivity = activities.find(activity => activity.id == selectedActivityId) ?? new ActivityModel(null, "", "", 0)
                res.render("activity_mng.ejs", { activities, selectedActivity, authenticatedUser: req.authenticatedUser })
                //user: req.authenticatedUser
            }).catch(error => {
                console.log(error)
            })






    }
    /**
     * 
     * This endpoint handles for POSTs for the various CRUD operations on the edit form.
     *  @type {express.RequestHandler}
     */

    static handleActivityManagement(req, res) {

        const selectedActivityId = req.params.id //id
        const formData = req.body  //data sent from form
        const action = formData.action  //action

        //***************WHEN Data comes from From 1- validate then 2-construct */ 3- hash password


        //Validate form Data
        ///validate ID
        if (selectedActivityId) {
            if (!/^[0-9]+$/.test(selectedActivityId)) {
                res.status(400).render("status.ejs", {
                    status: "Invalid input provided",
                    message: "please enter a valid activity."

                })
                return 
            }

        }

        //validate  activity name
        if (!/^[a-zA-Z\-\ \',.!@$_]{2,}$/.test(formData.name)) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a valid activity name containg only numbers, a-z, -, ', and whitespace."
            })
            return
        }
        //validate activity adddress 
        if (formData.description) {
            if (!/^[a-zA-Z0-9\-\ \']{2,}$/.test(formData.description)) {
                res.status(400).render("status.ejs", {
                    status: "Invalid input provided",
                    message: "please enter a valid description containg only 0-9, a-z, -, ', and whitespace."
                })
                return
            }
        }




        const activity = new ActivityModel(
            selectedActivityId,
            formData.name,
            formData.description,
            0
        )
        //console.log(activity)

        if (action == "create") {
            ActivityModel.create(activity)
                .then(result => {
                    res.redirect("/activity_mng")
                }).catch(error => {
                    console.error(error)
                    res.status(500).render("status.ejs", {
                        status: "Database error",
                        message: "The activity could not be created."
                    })
                })

        } else if (action == "update") {

            ActivityModel.update(activity)
                .then(result => {
                    if (result.affectedRows > 0) {
                        res.redirect("/activity_mng")
                    }
                    else {
                        res.status(500).render("status.ejs", { 
                            status: "Activity update error",
                            message: "The activity could not be found ."
                        })
                    }
                })
                .catch(error => {
                    console.error(error)
                    res.status(500).render("status.ejs", {
                        status: "Database error",
                        message: "The activity could not be updated."
                    })
                })

        } else if (action == "delete") {
            ActivityModel.delete(selectedActivityId)
                .then(result => {
                    if (result.affectedRows > 0) {
                        res.redirect("/activity_mng")
                    } else {
                        res.status(500).render("status.ejs", {
                            status: "Location delete error",
                            message: "The activity could not be found ."
                        })

                    }

                })
                .catch(error => {

                    console.error(error)
                    res.status(500).render("status.ejs", {
                        status: "Database error",
                        message: "The activity could not be deleted."
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