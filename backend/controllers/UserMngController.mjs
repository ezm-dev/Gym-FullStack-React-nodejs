import express from "express"
import bcrypt from "bcryptjs"
import { UserModel } from "../models/UserModel.mjs"
import { AuthenticationController } from "./AuthenicationController.mjs"
import validator from "validator"

/**
 * User Managment Controller for Users CRUD 
 */
export class UserMngController {
    /**
     * The routes defined by UserMngController
     */
    static routes = express.Router()

    static {
        //setup routes here
        this.routes.get("/", AuthenticationController.restrict(["admin"]), this.viewUserManagment)//get the page with from empty
        this.routes.get("/:id", AuthenticationController.restrict(["admin"]), this.viewUserManagment)//get the page with specific id

        this.routes.post("/", AuthenticationController.restrict(["admin"]), this.handleUserManagement)// create
        this.routes.post("/:id", AuthenticationController.restrict(["admin"]), this.handleUserManagement)//recieve del,update
    }


    /**
     * 
     * This endpoint handels GET-ting and displaying the user CRUD page
     *  @type {express.RequestHandler}
     */
    static viewUserManagment(req, res) {
        const selectedUserId = req.params.id
        UserModel.getAll()
            .then(users => {
                const selectedUser = users.find(user => user.id == selectedUserId) ?? new UserModel(null, "", "", "", "", "", 0)
                res.render("user_management.ejs", { users, selectedUser, authenticatedUser: req.authenticatedUser })
                //user: req.authenticatedUser
            }).catch(error => {
                console.log(error)
                res.status(500).render("status.ejs", { //no uderid  or deleted 404
                    status: "Database error",
                    message: " The user could not be found ."
                })
            })

    }

    /**
     * 
     * This endpoint handles for POSTs for the various CRUD operations on the edit form.
     *  @type {express.RequestHandler}
     */

    static handleUserManagement(req, res) {

        const selectedUserId = req.params.id //id
        const formData = req.body  //data sent from form
        const action = formData.action  //action

        //Validate form Data
        ///validate ID
        if (selectedUserId) {
            if (!/^[0-9]+$/.test(selectedUserId)) {
                res.status(400).render("status.ejs", {
                    status: "Invalid input provided",
                    message: "please enter a valid user."

                })
                return  //!res.headersSent
            }

        }

        //validate name(first& last)
        if (!/^[a-zA-Z\-\ \']{2,}$/.test(formData.firstName)) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a valid first name containg only a-z, -, ', and whitespace."
            })
            return
        }

        if (!/^[a-zA-Z\-\ \']{2,}$/.test(formData.lastName)) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a valid last name containg only a-z, -, ', and whitespace."
            })
            return
        }

        

        if (!validator.isEmail(formData.email)) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a valid email address."
            })
            return

        }
        //password
        if (!validator.isStrongPassword(formData.password, { minLength: 6, minLowercase: 1, minNumbers: 1 })) {
            //console.log(validator.isStrongPassword(formData.password))
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a strong password { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1} "
            })
            return

        }

        const user = new UserModel(
            selectedUserId,
            formData.firstName,
            formData.lastName,
            formData.email,
            formData.password,
            formData.role
        )
        //Hasing password
        if (!user.password.startsWith("$2b")) {
            user.password = bcrypt.hashSync(user.password)
        }

        if (action == "create") {
            UserModel.create(user)
                .then(result => {
                    res.redirect("/users")
                }).catch(error => {
                    console.error(error)
                    res.status(500).render("status.ejs", {
                        status: "Database error",
                        message: "The user could not be created."
                    })
                })

        } else if (action == "update") {
            UserModel.update(user)
                .then(result => {
                    if (result.affectedRows > 0) {
                        res.redirect("/users")
                    }
                    else {
                        res.status(500).render("status.ejs", { //no uderid  or deleted 404
                            status: "Employee update error",
                            message: "The user could not be found ."
                        })
                    }
                })
                .catch(error => {
                    console.error(error)
                    res.status(500).render("status.ejs", {
                        status: "Database error",
                        message: "The user could not be updated."
                    })
                })

        } else if (action == "delete") {
            UserModel.delete(selectedUserId)
                .then(result => {
                    if (result.affectedRows > 0) {
                        res.redirect("/users")
                    } else {
                        res.status(500).render("status.ejs", {
                            status: "Employee delete error",
                            message: "The user could not be found ."
                        })

                    }

                })
                .catch(error => {

                    console.error(error)
                    res.status(500).render("status.ejs", {
                        status: "Database error",
                        message: "The user could not be deleted."
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