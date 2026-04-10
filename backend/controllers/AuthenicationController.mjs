import express from "express"
import session from "express-session"
import bcrypt from "bcryptjs"
import { UserModel } from "../models/UserModel.mjs"
import validator from "validator"

/**
 * Authentication Controller handels Loggining and user sessions
 */
export class AuthenticationController {
    static middleware = express.Router()
    static routes = express.Router()

    /**
     * The routes  and session middleware defined by AuthenticationController
     * 
     */
    static {

        this.middleware.use(session({
            // crypto.randomUUID
            secret: '6a01c47c-1cad-4000-92a4-0e9a3a059e85',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: "auto"
            }

        }))

        this.middleware.use(this.#session_authentication)
        this.routes.get("/", this.viewAuthentication)
        this.routes.post("/", this.handleAuthenticate)

        this.routes.delete("/", this.handleDeauthenticate)//next semsester(forms & links can't trigger delete, client side only)
        this.routes.get("/logout", this.handleDeauthenticate)//current version
    }

    /**
     * This is a middleware function, It's job is to 
     * automatically load the logged in users details from the database based on their session.
     * @type {express.ReuestHandler}
     */
    static async #session_authentication(req, res, next) { //resume authentication (load user details ) with every nrew req
        //convert req.session.userId = user.id to req.authenticaedUser
        //if request has a session before and don't have authenticated user(not retieved his data)
        if (req.session.userId && !req.authenticatedUser) {
            try {
                req.authenticatedUser = await UserModel.getById(req.session.userId)

            } catch (error) {
                console.error(error) //if(req.authenticateduser) //someone loged in 

            }

        } next()



    }

    /**
     * TODO: Implement stateless authentication middleware that loads the user from the database on the API key.
     * (next semester)
     * @type {express.ReuestHandler}
     */
    static async #api_key_authentication(req, res, next) {

    }


    /**
     * Implements getting the login page/view. It will have
     * a form that allows the user to enter username and password.
     * @type {express.ReuestHandler}
     */
    static viewAuthentication(req, res) {
        res.render("login.ejs")

    }

    /**
     * Handles the login process, checks the body for a username and password,
     * then attemps to find a matching user in  the database.
     * If password verification is successful, then the user ID will be stored in the session,
     * enabling the server to rememeber that the user has logged in.
     * 
     * If handleAuthenticate receives form data, then it will setup a session.
     * If handleAuthenticte receives JSON data, then it wikk setup api key.
     * @type {express.ReuestHandler} 
     */
    static async handleAuthenticate(req, res) {
        const contentType = req.get("Content-Type")
        //either JSON or  form data, access them through req.body


        const email = req.body.email
        const password = req.body.password

        //validation
        if (!validator.isEmail(email)) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a valid email address."
            })
            return

        }
        //{minLength: 8,minLowercase: 1,minUppercase: 1,  minNumbers: 1}
        if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minNumbers: 1 })) {
            //if(!/^[a-zA-Z\-\!@#$%^&*_()]{8,}$/.test(password)){
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a strong password { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}"
            })
            return

        }

        //end of validation

        if (contentType == "application/x-www-form-urlencoded") {
            try {
                const user = await UserModel.getByUsername(email)

                //compare string received and encrypted from db--you can use compareSync
                const isCorrectPassword = await bcrypt.compare(password, user.password)


                //Adjsut the navigation//////////
                if (isCorrectPassword) {
                    req.session.userId = user.id
                    // res.redirect("/user")  //user crud

                    // //Divide based on the roles(check)
                    if (user.role == "admin") {
                        res.redirect("/users")  //user crud
                    }
                    else if (user.role == "trainer") {
                        res.redirect("/trainer")// trainer timetable


                    } else if (user.role == "member") {
                        res.redirect("/sessions")//member timetable
                    }
                    else {
                        res.redirect("/")  ////////home
                    }



                } else {
                    res.status(400).render("status.ejs", {
                        status: "Authenticate Failed",
                        message: "Invalid credentials"

                    })
                }

            } catch (error) {
                if (error == "not found") {
                    res.status(400).render("status.ejs", {
                        status: "Authenticate Failed",
                        message: "Invalid credentials"

                    })

                } else {
                    console.log(error)
                    res.status(500).render("status.ejs", {
                        staus: "Database error",
                        message: "Authentication failed"

                    })
                }


            }
        } else if (contentType == "application/json") {
            //TODO: Implement API key based authentication.

        } else {
            //Error,unsupported authentication request.
            res.status(400).render("status.ejs", {
                status: "Authenticate Failed",
                message: "Invalid authentication request body"

            })


        }


    }

    /**
     *Handles logging out the current user by clearing their session/api key.
     * @type {express.ReuestHandler}
     */

    static handleDeauthenticate(req, res) {
        if (req.authenticatedUser) { //the user logged in
            if (req.session.userId) { // the user has a valid cookie
                req.session.destroy()
                res.status(200).render("status.ejs", {
                    status: "logged out",
                    message: "you have been logged out"
                })
            }//TODO: handle the authentication for the api key(th above only works for sessions)



        } else { //if someone try to logout without login
            res.status(401).render("status.ejs", {
                status: "Unauthnticated",
                message: "Please login to access the requested resource."
            })
        }

    }


    /**
     * This is a middleware building function(i.e.,a higher-order function- meaning that
     * It will be build and return another function as a result).
     * 
     * WE will use this function to restric specific routes in various controllers.
     * @param {Array<string>} allowedRoles 
     * @returns {express.RequestHandler}
     */
    static restrict(allowedRoles) {
        return function (req, res, next) {
            if (req.authenticatedUser) {
                if (allowedRoles.includes(req.authenticatedUser.role)) {
                    next()
                } else {
                    res.status(403).render("status.ejs", {
                        status: "Access forbidden",
                        message: "Role does not have access to the requested resource"
                    })
                }
            } else {
                res.status(401).render("status.ejs", {
                    status: "Unauthnticated",
                    message: "Please login to access the requested resource."
                })
            }
        }

    }

}







