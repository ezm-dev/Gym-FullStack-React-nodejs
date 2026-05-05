import { useCallback, useEffect, useState } from "react"
import { fetchAPI } from "../api.mjs"
import { useNavigate } from "react-router"
import { useAuthenticate } from "../authentication/useAuthenticate"

function PostsListView() {
    const {user}=useAuthenticate()
    const [posts, setPosts] = useState([])
    const [status, setStatus] = useState(null)//post status
    const [getStatus, setGetStatus] = useState(null)//get Status
    //const navigate = useNavigate()
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    //delete post by ID
    const deletePost = (id)=>{
        fetchAPI("DELETE","/posts/"+id,null,user.authenticationKey)
    .then(response => {
      if (response.status === 200) {
        setPosts((prevPosts) => prevPosts.filter((p) => p.post.id !== id))
      } else {
        console.error("Failed to delete: "+response.body.message);
      }
    })
    .catch(error => {
      console.error("Delete error:"+error);
    })
    }
    
    const clearForm = () => {
        setTitle("")
        setContent("")
    }

    const loadPosts= useCallback(() => {
     
        fetchAPI("GET", "/posts")
            .then(response => 
                {
                if (response.status == 200) {
                    setPosts(response.body)
                    setGetStatus(null)
                } else {
                    setGetStatus(response.body.message)
                }
            })
            .catch(error => {
                setGetStatus(error)
            })
        
    }, [setPosts, setGetStatus])

    useEffect(() => {
         loadPosts()
    }, [loadPosts])
    
    //validation
    // Form validation and submission state
    const [validationErrors, setValidationErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const submitForm = useCallback(() => {
        setLoading(true)

        const validationErrors = {}
        if (!/^[a-zA-Z0-9\-\ \']{2,50}$/.test(title)){
            validationErrors["title"] = "Missing or invalid title."
        }
        if (!/^[a-zA-Z0-9\s\-\',.!@$%&*+=-_()\[\]{}]{2,500}$/.test(content)) {
            validationErrors["content"] = "Missing or invalid content."
        }
                setValidationErrors(validationErrors)

        // Early return if there was validation errors
        if (Object.keys(validationErrors).length > 0) {
            setLoading(false)
            return
        }
   
        fetchAPI("POST", "/posts", {
            userId: user.id,
            title: title,
            content: content,
            date: new Date().toLocaleDateString("en-CA")
        },user.authenticationKey)
            .then(response => {
                if (response.status == 200) {

                    setStatus("Posted Successfully")
                    setLoading(false)
                    clearForm()
                    loadPosts()
                   // setStatus(null)


                } else {
                    setStatus("Failed to create post - " + response.body.message)
                    setLoading(false)
                }
            })
            .catch(error => {
                setStatus("Failed to create post - " + error)
                setLoading(false)
            })
    }, [
        user, 
        title, 
        content,  
        setPosts,
        setValidationErrors, 
        setStatus, 
        setLoading,
    ])

    return <section className="flex flex-col items-center gap-4 p-4"> 
       <h1 className="text-2xl font-bold drop-shadow-md my-5">Blog</h1>
        {user&& <fieldset className="fieldset p-4 self-stretch  text-lg">
           {/* <legend className="fieldset-legend text-2xl p-2"></legend> */}
           <label className="label ">Title:</label>
           <input
           value = {title}
           onChange={e => setTitle(e.target.value)}
            className="input w-full text-lg" type="text"  />
           {validationErrors["title"]&&<label className="label text-red-500 justify-self-end">{validationErrors["title"]}</label>}
           
           <label className="label">Content:</label>
           <textarea
           value = {content}
           onChange={e => setContent(e.target.value)}           
            className="textarea text-lg h-30 w-full" type="text"  />
           {validationErrors["content"]&&<label className="label text-red-500 justify-self-end">{validationErrors["content"]}</label>}

        <button
         disabled={loading} //{loading == true} disable button when loading
         onClick={()=>submitForm()} 
         className="btn btn-outline btn-lg self-stretch mt-5">
         Create{loading && <span className="loading loading-spinner loading-sm"></span>}
        </button>
        
        <button
         onClick={()=>clearForm()} 
         className="btn btn-outline btn-lg self-stretch mt-5">
         Clear
        </button>
        {status  && <span className="text-center">{status}</span>} 
        </fieldset>}
        
        
        {!getStatus && !posts && <span className="loading loading-spinner loading-xl"></span>}
        {posts && posts.map((p) => (
            <div key={p.post.id} className="card w-full self-stretch bg-base-200 shadow-sm">
            <div className="card-body">
                <div className="card-actions justify-end">
                {user &&p.user && user.id == p.user.id &&<button 
                onClick={()=>deletePost(p.post.id)}
                className="btn btn-square btn-sm bg-base-300 text-red-600 font-semibold">X

                </button>}
                </div>
                <p className="font-bold">
                {p.user?`${p.user.firstName} ${p.user.lastName}`:""} - {p.post.date}
                </p>
                <p className="font-semibold">{p.post.title}</p>
                <p>{p.post.content}</p>
            </div>
            </div>
        ))}


        
                    
    </section>
     
}
export default  PostsListView








