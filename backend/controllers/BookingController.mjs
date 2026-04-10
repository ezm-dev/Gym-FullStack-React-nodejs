import express from "express"
import { DatabaseModel } from "../models/DatabaseModel.mjs"
import { BookingModel } from "../models/BookingModel.mjs"
import { ActivityModel } from "../models/ActivityModel.mjs"
import { SessionModel } from "../models/SessionModel.mjs"
import validator from "validator"
import { SessionALTModel } from "../models/SessionALTModel.mjs"
import { BookingsDetailsModel } from "../models/BookingsDetailsModel.mjs"
import { AuthenticationController } from "./AuthenicationController.mjs"
/**
 * Booking Controller handels viewing booking and booking functionalities 
 */
export class BookingController {
  static routes = express.Router()


/**
 * The routes defined by BookingController
 * 
 */
  static {


    //  this.routes.post("/", this.viewSessionTrainerTime)
    this.routes.post("/", AuthenticationController.restrict(["member"]), this.createBooking)
    this.routes.get("/", AuthenticationController.restrict(["member"]), this.viewMybookings)
    this.routes.post("/:id", AuthenticationController.restrict(["member"]), this.deleteBooking)

  }

  /**
    * 
    * This endpoint handles viewing the bookings
    *  @type {express.RequestHandler}
    */
  static viewMybookings(req, res) {
    const authenticatedUser = req.authenticatedUser
    BookingsDetailsModel.getBookingDetailsByUser(authenticatedUser.id) //if created or db error
      .then(results => {
        //console.log(results)
        //  console.log(results)
        res.render("member_bookings.ejs", { results, authenticatedUser: req.authenticatedUser })
      }).catch(error => {
        console.log(error)
        res.status(400).render("status.ejs", {
          status: "Bookings not found",
          message: "Maybe bookings are deleted or invalid, please contact our staff."

        })
        return


      })

  }



  /**
    * 
    * This endpoint handles creating a new booking
    *  @type {express.RequestHandler}
    */
  static async createBooking(req, res) {
    try {

      const sessionId = req.body.sessionDetails  //select
      const authenticatedUser = req.authenticatedUser

      //check if the user has booking at the same time 


      const bookingDetails = await BookingsDetailsModel.getBookingDetailsByUser(authenticatedUser.id) //if created or db error
      const selected = await SessionModel.getById(sessionId)

      // const selectedDate1 = new Date(selected.date).toISOString().split("T")[0]xx date shift
      //const selectedDate2 = selected.date.toLocaleDateString("en-CA")//if already object

      //selected session date to compare...1
      const selectedDate = new Date(selected.date).toLocaleDateString("en-CA")

      ///if previous bookings--compare current session with previous bookings
      if (bookingDetails.length > 0) {

        //let  selectedDate = new Date(selected.session.date).toISOString().split("T")[0]

        for (let result of bookingDetails) {
          //each booking session date to compare....2
          let sessionDate = new Date(result.session.date).toLocaleDateString("en-CA")
          // console.log(selectedDate,sessionDate)
          // console.log(selectedDate==sessionDate)
          // console.log(typeof(selectedDate),typeof(sessionDate))


          //if same session
          if (result.session.id == sessionId) { // this if working(SAME SESSION)

            res.render("status.ejs", {
              status: "Invalid Booking for this session",
              message: "You already booked this session before."

            })
            return
            //if same time
          } else if (sessionDate == selectedDate && result.session.startTime == selected.startTime) {

            res.render("status.ejs", {
              status: "Invalid Booking for this session",
              message: " You cannot book this session, you already have one booked at the same time."

            })
            return

          }


        }//end for 
      }//end if

      //      ///create Booking
      //     const date =  DatabaseModel.toMySqlDate(selected.date)///*************

      const booking = new BookingModel(null, authenticatedUser.id, sessionId, new Date())
      const bookingResult = await BookingModel.create(booking) //if created or db error
      const selectedSession = await SessionALTModel.getById(selected.id)
      res.render("confirmation.ejs", { results: selectedSession, date: selectedDate, authenticatedUser: req.authenticatedUser })

    } catch (error) {
      if (error == "not found") {
        res.status(400).render("status.ejs", {
          status: "Session Details not found",
          message: "Maybe the session is deleted or invalid, please contact our staff."

        })
        return
      } else {
        console.log(error)
        res.status(500).render("status.ejs", {
          staus: "Database error",
          message: "Failed to create booking, please contact our staff"

        })
      }


    }



  }





  /**
    * 
    * This endpoint handles deleting the booking
    *  @type {express.RequestHandler}
    */
  static deleteBooking(req, res) {
    //we can get by params

    const bookingId = req.body.bookingId

    BookingModel.delete(bookingId)
      .then(result => {
        if (result.affectedRows > 0) {
          res.redirect("/bookings")
        } else {
          res.status(404).render("status.ejs", {
            status: "Booking delete error",
            message: "The booking could not be found."
          })

        }

      }).catch(error => {

        console.error(error)
        res.status(500).render("status.ejs", {
          status: "Database error",
          message: "The booking could not be deleted."
        })

      })
  }




}