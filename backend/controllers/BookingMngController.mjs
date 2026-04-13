import express from "express"
import bcrypt from "bcryptjs"
import { AuthenticationController } from "./AuthenicationController.mjs"
import validator from "validator"
import { SessionALTModel } from "../models/SessionALTModel.mjs"
import { SessionModel } from "../models/SessionModel.mjs"
import { ActivityModel } from "../models/ActivityModel.mjs"
import { LocationModel } from "../models/LocationModel.mjs"
import { UserModel } from "../models/UserModel.mjs"
import { BookingsDetailsModel } from "../models/BookingsDetailsModel.mjs"
import { BookingModel } from "../models/BookingModel.mjs"



/**
 * BookingMngController handels Bookings CRUD
 */

export class BookingMngController {
    static routes = express.Router()

    /**
     * The routes defined by BookingMngController
     */
    static {

        //setup routes here

        this.routes.get("/", AuthenticationController.restrict(["admin"]), this.viewBooking)//get the page with from empty
        this.routes.get("/:id", AuthenticationController.restrict(["admin"]), this.DeleteBooking)//recieve del
    }




    /**
     * 
     * This endpoint handels GET-ting and displaying the Booking CRUD page
     *  @type {express.RequestHandler}
     */
    static async viewBooking(req, res) {
        const selectedEmail = decodeURIComponent(req.query.selectedEmail)

        if (selectedEmail && req.query.find == "Bookings") {


            //validate email

            if (!validator.isEmail(selectedEmail)) {
                res.status(400).render("status.ejs", {
                    status: "Invalid input provided",
                    message: "This email is invalid, please enter a valid email address."
                })
                return

            }

            UserModel.getByUsername(selectedEmail)
                .then(user => {

                   BookingsDetailsModel.getBookingDetailsByEmail(selectedEmail)
                        .then(bookingDetails => {

                            res.render("booking_mng.ejs", { bookingDetails, authenticatedUser: req.authenticatedUser })



                        }).catch(error => {
                            res.status(500).render("status.ejs", {
                                status: "Database Error",
                                message: "Bookings details could not be retrieved for that user, the user may be deleted or invalid ."
                            })

                        })

                }).catch(error => {
                    //console.log(error)

                    res.status(400).render("status.ejs", { //no uderid  or deleted 404
                        status: "Invalid user",
                        message: "The user could not be found or deleted ."
                    })



                })

        } else {   //getALL BOOKINGS
          BookingsDetailsModel.getAllBookingDetails()
                .then(bookingDetails => {

                    res.render("booking_mng.ejs", { bookingDetails, authenticatedUser: req.authenticatedUser })

                }).catch(error => {
                    console.log(error)
                    res.status(500).render("status.ejs", {
                        status: "Database Error",
                        message: "Bookings details could not be retrieved ."
                    })


                })

        }

    }
   

    /**
     * 
     * This endpoint handles delete operations on the edit form.
     *  @type {express.RequestHandler}
     */

    static DeleteBooking(req, res) {
        const id = req.params.id
        BookingModel.delete(id)
            .then(result => {
                if (result.affectedRows > 0) {
                    res.redirect("/booking_mng")


                } else {
                    res.status(404).render("status.ejs", {
                        status: "Booking delete error",
                        message: "Booking could not be found ."
                    })
                    return

                }

            })
            .catch(error => {

                console.error(error)
                res.status(500).render("status.ejs", {
                    status: "Database error",
                    message: "Booking could not be deleted."
                })

            })



    }


}