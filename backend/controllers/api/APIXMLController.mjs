import express from "express"
import { DatabaseModel } from "../../models/DatabaseModel.mjs"
import { SessionALTModel } from "../../models/SessionALTModel.mjs"
import { BookingsDetailsModel } from "../../models/BookingsDetailsModel.mjs"
import { AuthenticationController } from "../AuthenicationController.mjs"
import { APIAuthenticationController } from "./APIAuthenticationController.mjs"

export class APIXMLController{

    static routes = express.Router()

    static{
        this.routes.get("/sessions",APIAuthenticationController.restrict(["trainer"]) , this.getSessionsXML)
        this.routes.get("/bookings", APIAuthenticationController.restrict(["member"]) ,this.getBookingsXML)


    }

    /**
     * Handle exporting a user's bookings to XML
     *
     * @type {express.RequestHandler}
     * @openapi
     * /api/xml/bookings:
     *   get:
     *     summary: "Export all member's bookings to XML"
     *     tags: [XML]
     *     security:
     *       - ApiKey: []
     *     responses:
     *       '200':
     *         description: 'User bookings exported in XML'
     *         content:
     *           text/xml:
     *             schema:
     *               type: object
     *               xml:
     *                 name: bookings
     *                 attribute: true
     *               properties:
     *                 bookings:
     *                   type: array
     *                   xml:
     *                     name: bookings
     *                   items:
     *                     type: object
     *                     xml:
     *                       name: booking
     *                     properties:
     *                       activity:
     *                         type: string
     *                         example: Indoor cycling
     *                       location:
     *                         type: string
     *                         example: Chermside
     *                       date:
     *                         type: string
     *                         format: date
     *                         example: 2025-05-04
     *                       time:
     *                         type: string
     *                         example: 08:00:00
     *       default:
     *         $ref: "#/components/responses/Error"
     */

    static async getBookingsXML(req,res){
        try {
            const exportDate = DatabaseModel.toMySqlDate(new Date())
            const bookings = await BookingsDetailsModel.getBookingDetailsByUser(req.authenticatedUser.id)
            const name = req.authenticatedUser.firstName+" "+req.authenticatedUser.lastName
           // const name = bookings[0].user.firstName+" "+bookings[0].user.lastName
            //console.log(name)
            res.status(200).render("xml/bookings.xml.ejs", {bookings, exportDate,name})
      
        } catch (error) {
            console.error(error)
            res.status(500).json({
                message: "failed to export xml for bookings",
                errors: [error]
            })
        }

    }

    /**
     * Handle exporting all trainer sessions to XML
     *
     * @type {express.RequestHandler}
     * @openapi
     * /api/xml/sessions:
     *   get:
     *     summary: "Export all trainer's sessions to XML"
     *     tags: [XML]
     *     security:
     *       - ApiKey: []
     *     responses:
     *       '200':
     *         description: 'Trainer sessions XML'
     *         content:
     *           text/xml:
     *             schema:
     *               type: array
     *               xml:
     *                 name: sessions
     *               items:
     *                 type: object
     *                 properties:
     *                   activity:
     *                     type: string
     *                     example: HIIT
     *                   location:
     *                     type: string
     *                     example: Brisbane City
     *                   date:
     *                     type: string
     *                     format: date
     *                     example: 2025-03-14
     *                   time:
     *                     type: string
     *                     example: 08:00:00
     *       default:
     *         $ref: "#/components/responses/Error"
     */
    static async getSessionsXML(req,res){
        try {
            const exportDate = DatabaseModel.toMySqlDate(new Date())
            const sessions = await SessionALTModel.getSessionsByTrainerId( req.authenticatedUser.id)
            const name = req.authenticatedUser.firstName+" "+req.authenticatedUser.lastName
            res.status(200).render("xml/sessions.xml.ejs", {sessions, exportDate,name})
      
        } catch (error) {
            console.error(error)
            res.status(500).json({
                message: "failed to export xml for sessions",
                errors: [error]
            })
        }

    }
}