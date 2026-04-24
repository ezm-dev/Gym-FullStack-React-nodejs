import {useNavigate, useParams} from "react-router"
import { useCallback, useEffect, useState } from "react"
import { fetchAPI } from "../api.mjs"
import validator from "validator"



function RegisterView(){

  const[firstName, setFirstName] = useState("")
  const[lastName, setLastName] = useState("")
  const[email, setEmail] = useState("")
  const[password, setPassword] = useState("")

  //Form validation and submission state
  const [validationErrors, setValidationErrors] = useState({})//firstName:Error
  const [loading, setLoading] = useState(false) //1-loading in the button(disable button &loading)
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)


  const submitForm =  useCallback(()=>{
    //Set Loading
        setLoading(true) //and in button set disabled when loading- disabled={loading}&inside spinner
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

      if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1,minUppercase: 1,minSymbols: 1, minNumbers: 1,returnScore: false })) {
         validationErrors["password"] = "Missing or invalid password"
      }
        
      setValidationErrors(validationErrors)

     //Early return if there was a validation errors
    if(Object.keys(validationErrors).length >0){
      setLoading(false)
      return 
    }

    //2- posting.................
      fetchAPI("POST","/users",{
   
      "firstName": firstName,
      "lastName": lastName,
      "email": email,
      "password": password,
      "role": "member",
      "deleted": 0
    },null)
    .then(response =>{
      if(response.status == 200){
        setStatus("Registered Successfully")
        setLoading(false)
        navigate("/login")

      }else{
        setStatus("Failed to register - "+response.body.message)
        setLoading(false)
      }

    })
    .catch(error =>{
      setStatus("Failed to register - "+ error)
      setLoading(false)

    })
      
    
    },[firstName, lastName,email, password,setLoading, setValidationErrors,setStatus, navigate])//,userId,BookingsListView


    return <section className="flex flex-col items-center gap-4 p-4"> 
      <h1 className="text-2xl font-bold drop-shadow-md my-5">Register</h1>
        <fieldset className="fieldset p-4 self-stretch  text-lg">
           {/* <legend className="fieldset-legend text-2xl p-2"></legend> */}
           <label className="label ">First Name:</label>
           <input
           value = {firstName}
           onChange={e => setFirstName(e.target.value)}
            className="input w-full" type="text"  />
           {validationErrors["firstName"]&&<label className="label text-red-500 justify-self-end">{validationErrors["firstName"]}</label>}
           
           <label className="label">Last Name:</label>
           <input
           value = {lastName}
           onChange={e => setLastName(e.target.value)}           
            className="input w-full" type="text"  />
           {validationErrors["lastName"]&&<label className="label text-red-500 justify-self-end">{validationErrors["lastName"]}</label>}

           <label className="label">Email:</label>
           <input
           value = {email}
           onChange={e => setEmail(e.target.value)}           
            className="input w-full" type="email"  />
           {validationErrors["email"]&&<label className="label text-red-500 justify-self-end">{validationErrors["email"]}</label>}

           <label className="label">Password:</label>
           <input
           value = {password}
           onChange={e => setPassword(e.target.value)}            
            className="input w-full" type="password"  />
           {validationErrors["password"]&&<label className="label text-red-500 justify-self-end">{validationErrors["password"]}</label>}
          
        </fieldset>

        <button
         disabled={loading} //{loading == true} disable button when loading
         onClick={()=>submitForm()} 
         className="btn btn-outline btn-lg self-stretch ">
         Register{loading && <span className="loading loading-spinner loading-sm"></span>}
        </button>
        {status}
        
 

    </section>
     
}
export default RegisterView