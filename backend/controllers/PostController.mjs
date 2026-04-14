import express from "express"
import { PostModel } from "../models/PostModel.mjs"
import { PostUserModel } from "../models/PostUserModel.mjs"
import { DatabaseModel } from "../models/DatabaseModel.mjs"
import { AuthenticationController } from "./AuthenicationController.mjs"


/**
 * Post Controller handels viewing posts and its functionalities 
 */

export class PostController {
    static routes = express.Router()

    /**
     * The routes defined by PostController
     */
    static {
        //intialise  routes
        this.routes.get("/",this.viewPostList)
        this.routes.post("/create", AuthenticationController.restrict(["member","admin","trainer"]),this.createPost)
        this.routes.get("/:id", AuthenticationController.restrict(["member","admin","trainer"]),this.deletePost)


    }
    /**
     * This endpoint handles viewing the post page
     * @type {express.RequestHandler}
     * 
     */
    static viewPostList(req, res) {

        PostUserModel.getAll()
            .then(posts => {
                //console.log(posts)
                res.render("posts.ejs", { posts, authenticatedUser: req.authenticatedUser })

            }
            ).catch(error => {
                console.log(error)
                res.status(500).render("status.ejs", {
                    status: "Database error",
                    message: "Posts could not be found."
                })

            }
            )

    }
    
    /**
     * This endpoint handles creating the post
     *  @type {express.RequestHandler}
     *
     */
    static createPost(req, res) {
        const formData = req.body
        //Validate inputs
        if (!/^[a-zA-Z0-9\-\ \']{2,50}$/.test(formData.title)) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "please enter a valid Title(2 - 50(max) characters ) containg only 0-9, a-z, -, ', and whitespace."
            })
            return
        }

        // if(!/^[a-zA-Z0-9\-\ \']{2,}$/.test(formData.content))
        if (!/^[a-zA-Z0-9\s\-\',.!@$%&*+=-_()\[\]{}]{2,500}$/.test(formData.content)) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided",
                message: "Please enter a valid content(2- 500(max) characters)"
            })
            return
        }

        //authenticated users post new posts.
        const newPost = new PostModel(null, req.authenticatedUser.id, formData.title, formData.content, DatabaseModel.toMySqlDate(new Date()))
        //const newPost = new PostModel(null, formData.userId, formData.title, formData.content, DatabaseModel.toMySqlDate(new Date()))
        //console.log(newPost)
        PostModel.create(newPost)
            .then(result => {
                res.redirect("/posts")
            }).catch(error => {
                console.error(error)
                res.status(500).render("status.ejs", {
                    status: "Database error",
                    message: "The post could not be created."
                })
            })

    }

    /**
     * This endpoint handles deleting the post
     *  @type {express.RequestHandler}
     *
     */
    static deletePost(req, res) {
        const postId = req.params.id

        //validate postId is allowed to be deleted by this user
        PostModel.getById(postId)
            .then(post => {
                if (post.userId != req.authenticatedUser.id && req.authenticatedUser.role != "admin") {
                    res.status(403).render("status.ejs", {
                        status: "Access forbidden",
                        message: "Deleting this post is forbidden"
                    })
                    return

                }

            }

            ).catch(error => {
                //console.error(error)
                res.status(400).render("status.ejs", { //invalid post id
                    status: "Post Delete Error",
                    message: "The post colud not be found or invalid"
                })
                return
            })



        PostModel.delete(postId)
            .then(result => {
                if (result.affectedRows > 0) {
                    res.redirect("/posts")
                    return
                } else {
                    res.status(500).render("status.ejs", {
                        status: "Post Delete Error",
                        message: "The post could not be found ."
                    })
                    return
                }

            })
            .catch(error => {

                //  console.error(error)
                res.status(500).render("status.ejs", {
                    status: "Database error",
                    message: "The post could not be deleted."
                })
                return
            })

    }
}
