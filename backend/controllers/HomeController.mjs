import express from "express"
import { ActivityModel } from "../models/ActivityModel.mjs"
import { SessionALTModel } from "../models/SessionALTModel.mjs"
import { SessionModel } from "../models/SessionModel.mjs"


/**
 * Home Controller handels Home page
 */
export class HomeController{
    static routes = express.Router()
    /**
     * The route defined by HomeController
     */
    static{
        //intialise  routes
        this.routes.get("/", this.viewActivityList)
    }
    

    /**
     * 
     * This endpoint handels GET-ting and displaying the Home page
     *  @type {express.RequestHandler}
     */
    static viewActivityList(req,res){
 
            ActivityModel.getAll()
            .then(activities =>{
        
                res.render("activities_list.ejs",{activities, authenticatedUser: req.authenticatedUser})
            }
             ).catch(error=> console.log (error))

        }
    }
   
        
      

  