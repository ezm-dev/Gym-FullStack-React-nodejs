import express from "express"
import bcrypt from "bcryptjs"
import { UserModel } from "../models/UserModel.mjs"
import { AuthenticationController } from "./AuthenicationController.mjs"
import validator from "validator"
import { LocationModel } from "../models/LocationModel.mjs"



/**
 * Location Controller handels Location CRUD
 */
export class LocationMngController {
    static routes = express.Router()
    
    /**
     * The routes defined by LocationController
     */
    static {
        //setup routes here
        
        this.routes.get("/", AuthenticationController.restrict(["admin"]), this.viewLocationManagement)//get the page with from empty
        this.routes.get("/:id", AuthenticationController.restrict(["admin"]), this.viewLocationManagement)//get the page with specific id

        this.routes.post("/", AuthenticationController.restrict(["admin"]), this.handleLocationManagement)// create
        this.routes.post("/:id", AuthenticationController.restrict(["admin"]), this.handleLocationManagement)//recieve del,update
    }


    /**
     * 
     * This endpoint handels GET-ting and displaying the Location CRUD page
     *  @type {express.RequestHandler}
     */
    static viewLocationManagement(req, res) {
        //show empty form  or filled with one data
        const selectedLocationId = req.params.id
        LocationModel.getAll()
            .then(locations => {
                //search the list of all users for the user matching the selectedUserIdpassed in the url params
                //?? if the thing on left null --- use the right (find user or make a new one)
                const selectedLocation = locations.find(location => location.id == selectedLocationId) ?? new LocationModel(null, "", "", 0)
                res.render("location_mng.ejs", { locations, selectedLocation, authenticatedUser: req.authenticatedUser })
                //user: req.authenticatedUser
            }).catch(error => {
                console.log(error)
                res.status(500).render("status.ejs", {
                    status: "Database Error",
                    message: "Location could not be found or deleted."
                })
                return
            })






    }
    /**
     * 
     * This endpoint handles for POSTs for the various CRUD operations on the edit form.
     *  @type {express.RequestHandler}
     */

    static handleLocationManagement(req, res) {

        const selectedLocationId = req.params.id //id
        const formData = req.body  //data sent from form
        const action = formData.action  //action

        //***************WHEN Data comes from From 1- validate then 2-construct */ 3- hash password


        //Validate form Data
        ///validate ID
        if (selectedLocationId) {
            if (!/^[0-9]+$/.test(selectedLocationId)) {
                res.status(400).render("status.ejs", {
                    status: "Invalid input provided",
                    message: "please enter a valid location."

                })
                return 
            }

        }

        //validate  location name
        if (!/^[a-zA-Z\-\ \']{2,}$/.test(formData.name)) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "Please enter a valid location name containg only numbers, a-z, -, ', and whitespace."
            })
            return
        }
        //validate location adddress 
        if (formData.address) {
            if (!/^[a-zA-Z0-9\-\ \',._]{2,}$/.test(formData.address)) {
                res.status(400).render("status.ejs", {
                    status: "Invalid input provided",
                    message: "Please enter a valid address containg only 0-9, a-z, -, ', and whitespace."
                })
                return
            }

        }



        const location = new LocationModel(
            selectedLocationId,
            formData.name,
            formData.address,
            0
        )

        if (action == "create") {
            LocationModel.create(location)
                .then(result => {
                    res.redirect("/location_mng")
                }).catch(error => {
                    console.error(error)
                    res.status(500).render("status.ejs", {
                        status: "Database error",
                        message: "The location could not be created."
                    })
                })

        } else if (action == "update") {
            LocationModel.update(location)
                .then(result => {
                    if (result.affectedRows > 0) {
                        res.redirect("/location_mng")
                    }
                    else {
                        res.status(500).render("status.ejs", { //no uderid  or deleted 404
                            status: "Location update error",
                            message: "The location could not be found ."
                        })
                    }
                })
                .catch(error => {
                    console.error(error)
                    res.status(500).render("status.ejs", {
                        status: "Database error",
                        message: "The location could not be updated."
                    })
                })

        } else if (action == "delete") {
            LocationModel.delete(selectedLocationId)
                .then(result => {
                    if (result.affectedRows > 0) {
                        res.redirect("/location_mng")
                    } else {
                        res.status(500).render("status.ejs", {
                            status: "Location delete error",
                            message: "The location could not be found ."
                        })

                    }

                })
                .catch(error => {

                    console.error(error)
                    res.status(500).render("status.ejs", {
                        status: "Database error",
                        message: "The location could not be deleted."
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