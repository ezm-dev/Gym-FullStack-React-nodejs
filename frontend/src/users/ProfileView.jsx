import {useNavigate, useParams} from "react-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { fetchAPI } from "../api.mjs"
import validator from "validator"
import { useAuthenticate } from "../authentication/useAuthenticate"


function ProfileView(){

  const[firstName, setFirstName] = useState("")
  const[lastName, setLastName] = useState("")
  const[email, setEmail] = useState("")
  const[password, setPassword] = useState("")
  const {user} =useAuthenticate(["member","trainer","admin"])

  //Form validation and submission state
  const [validationErrors, setValidationErrors] = useState({})//firstName:Error
  const [loading, setLoading] = useState(false) //1-loading in the button(disable button &loading)
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)

  // const firstNameRef= useRef(null) //refrence element that has been renderes
  // const lastNameRef = useRef(null)
  // const emailRef = useRef(null)
  // const passwrodRef = useRef(null)


  const submitForm =  useCallback(()=>{
    //Set Loading
        setLoading(true) 
    //1-validation .................
        const validationErrors = {}
        //check for each input if valid or not
        //as you did at backend
        if(!/^[a-zA-Z\-\ \']{2,}$/.test(firstName)){
            validationErrors["firstName"] = "Missing or invalid first name"
        }
        if(!/^[a-zA-Z\-\ \']{1,}$/.test(lastName)){
            validationErrors["lastName"] = "Missing or invalid last name"
        }
        if (!validator.isEmail(email)) {
            validationErrors["email"] = "Missing or invalid email"
        }
    //if (!validator.isStrongPassword(password, {minLength: 6,minLowercase: 1,minUppercase: 1,minSymbols: 1,returnScore: false})) {
      if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1,minUppercase: 1,minSymbols: 1, minNumbers: 1,returnScore: false })) {
         validationErrors["password"] = "Missing or invalid password"
      }
        
      setValidationErrors(validationErrors)

     //Early return if there was a validation errors
    if(Object.keys(validationErrors).length >0){
      setLoading(false)
      return 
    }

    //2- updating................
    
      fetchAPI("PUT","/users/"+user.id,{  
      "firstName": firstName,
      "lastName": lastName,
      "email": email,
      "password": password,
      "role": user.role,
      "deleted": user.deleted,
      "authenticationKey":user.authenticationKey
    },user.authenticationKey)
    .then(response =>{
      if(response.status == 200){
        setStatus("Updated Successfully")
        setLoading(false)
       // navigate("/sessions")

      }else{
        setStatus("Failed to update - "+response.body.message)
        setLoading(false)
      }

    })
    .catch(error =>{
      setStatus("Failed to update - "+ error)
      setLoading(false)

    })
      
    
    },[user,firstName, lastName,email, password,setPassword,setLoading, setValidationErrors,setStatus, navigate])//,userId,BookingsListView

 
    
   //const ShowUserDetails = useCallback(()=>{


  useEffect(() => {
    if(user){
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setEmail(user.email)
      setPassword(user.password)
     
      }
          
  }, [user])   


    
    return <section className="flex flex-col items-center gap-4 p-4"> 
      <h1 className="text-2xl font-bold drop-shadow-md my-5">Profile</h1>
        <fieldset className="fieldset p-4 self-stretch  text-lg">
           {/* <legend className="fieldset-legend text-2xl p-2"></legend> */}
           <label className="label ">First Name:</label>
           <input
           value = {firstName}
          // ref = {firstNameRef}
           onChange={e => setFirstName(e.target.value)}
            className="input w-full" type="text"  />
           {validationErrors["firstName"]&&<label className="label text-red-500 justify-self-end">{validationErrors["firstName"]}</label>}
           
           <label className="label">Last Name:</label>
           <input
           value = {lastName}
          // ref = {lastNameRef}
           onChange={e => setLastName(e.target.value)}           
            className="input w-full" type="text"  />
           {validationErrors["lastName"]&&<label className="label text-red-500 justify-self-end">{validationErrors["lastName"]}</label>}

           <label className="label">Email:</label>
           <input
           value = {email}
          // ref = {emailRef}
           onChange={e => setEmail(e.target.value)}           
            className="input w-full" type="email"  />
           {validationErrors["email"]&&<label className="label text-red-500 justify-self-end">{validationErrors["email"]}</label>}

           <label className="label">Password:</label>
           <input
           value = {password}
          // ref= {passwrodRef}
           onChange={e => setPassword(e.target.value)}            
            className="input w-full" type="password"  />
           {validationErrors["password"]&&<label className="label text-red-500 justify-self-end">{validationErrors["password"]}</label>}
          
        </fieldset>


        <button
         onClick={()=>navigate("/sessions")} 
         className="btn btn-outline btn-lg self-stretch ">
         Cancel
        </button>
        <button
         disabled={loading} //{loading == true} disable button when loading
         onClick={()=>submitForm()} 
         className="btn btn-outline btn-lg self-stretch ">
         Save{loading && <span className="loading loading-spinner loading-sm"></span>}
        </button>
        {status}
        
 

    </section>
     
}
export default ProfileView