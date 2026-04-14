import express from "express"
import { UserModel } from "../models/UserModel.mjs"
import bcrypt from "bcryptjs"
import validator from "validator"


/**
 * Register Controller handels Register a new member
 */

export class RegisterController {
    static routes = express.Router()

    /**
      * The routes defined by Register Controller
      */

    static {
        //intialise  routes
        this.routes.get("/", this.viewRegister)
        this.routes.post("/", this.handleRegister)
    }

    /**
     * This endpoint handles viewing the  register page
     * @type {express.RequestHandler}
     * 
     * 
     */
    static viewRegister(req, res) {
        res.render("register.ejs")

    }


      /**
     * This endpoint handles creating a new user
     * @type {express.RequestHandler}
     * 
     */
    static handleRegister(req, res) {
        const formData = req.body
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

        // if(!validator.isMobilePhone(formData.customerPhone)){}

        if (!validator.isEmail(formData.email)) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a valid email address."
            })
            return

        }
        //{minLength: 8,minLowercase: 1,minUppercase: 1,  minNumbers: 1}
        if (!validator.isStrongPassword(formData.password, { minLength: 6, minLowercase: 1, minNumbers: 1 })) {
            //console.log(validator.isStrongPassword(formData.password))
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a strong password { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1} "
            })
            return

        }

        const user = new UserModel(
            null,
            formData.firstName,
            formData.lastName,
            formData.email,
            formData.password,
            "member"
        )
        //Hasing password
        if (!user.password.startsWith("$2a")) {
            user.password = bcrypt.hashSync(user.password)
        }

        UserModel.create(user)
            .then(result => {
                res.redirect("/authenticate")
            }).catch(error => {
                console.error(error)
                res.status(500).render("status.ejs", {
                    status: "Database error",
                    message: "The member account could not be created, please contact our staff."
                })
            })

    }


}