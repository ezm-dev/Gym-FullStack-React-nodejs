import express from "express"
import { APIAuthenticationController } from "./APIAuthenticationController.mjs"
import { UserModel } from "../../models/UserModel.mjs"
import bcrypt from "bcryptjs"


export class APIUsersController {
    static routes = express.Router()
    
    static {
       
       
        
        this.routes.post("/",this.createUser) //register
        this.routes.get( "/self",APIAuthenticationController.restrict(["any"]) ,this.getAuthenticatedUser)
        this.routes.put("/:id",APIAuthenticationController.restrict(["any"]),this.updateUser)
        

    }
    
    /**
     * Handle getting an user by their current authentication key header
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/users/self:
     *      get:
     *          summary: "Get user by current authentication key header"
     *          tags: [Users]
     *          security:
     *              - ApiKey: [] 
     *          responses:
     *              '200':
     *                  description: 'User with provide authentication key'
     *                  content:
     *                      application/json:
     *                          schema:
     *                              $ref: "#/components/schemas/User"
     *              default:
     *                  $ref: "#/components/responses/Error"
     */
    static async getAuthenticatedUser(req, res) {
        res.status(200).json(req.authenticatedUser)
    }

    /**
     * Handle updating an existing user
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/users/{id}:
     *   put:
     *     summary: "Update an existing user by ID"
     *     tags: [Users]
     *     security:
     *       - ApiKey: []
     *     parameters:
     *       - name: id
     *         in: path
     *         description: User ID
     *         required: true
     *         schema:
     *           type: integer
     *           example: 3
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: "#/components/schemas/UserALT"
     *     responses:
     *       '200':
     *         $ref: "#/components/responses/Updated"
     *       '403':
     *         $ref: "#/components/responses/Error"
     *       '404':
     *         $ref: "#/components/responses/NotFound"
     *       '500':
     *         $ref: "#/components/responses/Error"
     *       default:
     *         $ref: "#/components/responses/Error"
     */

    static async updateUser(req,res){ 
        try {
            //checkif user update his own details
            if (req.params.id != req.authenticatedUser.id) {
                res.status(403).json({
                    message: "Access forbidden! - Failure to update."
                })

                return
            }

           else{
                
            const user = new UserModel(
                req.params.id, //id come from url???not body
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                req.body.password,
                req.authenticatedUser.role,
                req.authenticatedUser.deleted,
                req.authenticatedUser.authenticationKey
            )
         if (!user.password.startsWith("$2b")) {
            user.password = bcrypt.hashSync(user.password)
        }
           // console.log(user)
            const result = await UserModel.update(user)
           

            if (result.affectedRows == 1) {
                res.status(200).json({
                    message: "user updated"
                })
            } else {
                res.status(404).json({
                    message: "user not found - update failed",
                })
            }
        }

        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Failed to update user",
                errors: [error]
            })
        }
    
        
    }



    /**
     * Handle creating a new user
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/users:
     *   post:
     *     summary: "Create a new user"
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: "#/components/schemas/UserALT"
     *     responses:
     *       '200':
     *         $ref: "#/components/responses/Created"
     *       '500':
     *         $ref: "#/components/responses/Error"
     *       '403':
     *         $ref: "#/components/responses/Error"
     *       default:
     *         $ref: "#/components/responses/Error"
     */
    static async createUser(req,res){
        try {
            const user = new UserModel(
                req.body.id,
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                bcrypt.hashSync(req.body.password),
                req.body.role,
                req.body.deleted,
                req.body.authenticationKey
            )

            const result = await UserModel.create(user)

            res.status(200).json({
                id: result.insertId,
                message: "user created"
            })
        } catch (error) {
            res.status(500).json({
                message: "Failed to create user",
                errors: [error]
            })
        }

    }


}