import { useCallback, useRef, useState,useEffect } from "react"
import { useAuthenticate } from "./useAuthenticate"
import { useNavigate } from "react-router"
import validator from "validator"

function LoginView(){
   const navigate = useNavigate()
   const [email, setEmail] = useState("")
   const [password, setPassword] =useState("")
   const {login, status, user} = useAuthenticate()
   const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

    const onLoginClick =  useCallback(()=>{
    setLoading(true)
    const validationErrors = {}
    //validation
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

    //Here do fetch authenticat & getback key
       login(email,password)
        console.log(email)
        console.log(password)
    },[email, password,login])

    //redirect based on his role
    useEffect(()=>{ 
      
        // if(user)
        //     navigate("/sessions")
         if(user && user.role=="member")
             navigate("/sessions")
        else if(user && user.role=="trainer")
               navigate("/trainer")
        else if(user && user.role=="admin")
               navigate("/posts")

    },[user,navigate])

    return <section className="flex flex-col items-center gap-4 p-4">
     <h1 className="text-2xl font-bold drop-shadow-md my-5">Login</h1>
        <label className="input w-full mb-5">
            <span className="label">Email</span>
            <input
            value ={email}
            onChange={e=> setEmail(e.target.value)}
            className="grow" type="text" />
             {validationErrors["email"]&&<label className="label text-red-500 justify-self-end">{validationErrors["email"]}</label>}
        </label>

        <label className="input w-full mb-5">
            <span className="label">Password</span>
            <input
            value ={password}
            onChange={e=> setPassword(e.target.value)}
            className="grow" type="password" />
            {validationErrors["password"]&&<label className="label text-red-500 justify-self-end">{validationErrors["password"]}</label>}
        </label>   

        <button
        //   disabled={loading} 
          onClick={()=>onLoginClick()}
          className=" btn  btn-outline btn-lg self-stretch">
          Login{status == "authenticating"  && <span className="loading loading-spinner loading-sm"></span>}
          </button>   
         {status && status != "authenticating" &&status != "logged out" &&  <span>{status}</span>}  
   


    </section>
     
}

export default LoginView