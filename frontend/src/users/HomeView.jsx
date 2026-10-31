import {useNavigate, useParams} from "react-router"
import { useAuthenticate } from "../authentication/useAuthenticate"



function HomeView(){
const {user}=useAuthenticate()
const navigate = useNavigate()
  
    return (
    <section className="flex flex-col items-center gap-4 p-4"> 
     <h1 className="text-2xl font-bold my-5">Welcome to Hi Street Gym 24/7</h1>
      <button className="btn btn-warning  btn-xl self-stretch my-5 shadow-lg" onClick={() => navigate('/login')}>Login</button>
      <button className="btn btn-warning btn-xl self-stretch my-5 shadow-lg"onClick={() => navigate('/register')}>Register</button>
      <button className="btn btn-warning btn-xl self-stretch my-5 shadow-lg" onClick={() => navigate('/posts')}>Blog</button>
     <div className="self-stretch my-5 p-4 rounded-lg border border-warning bg-base-200 shadow-lg">
        <h2 className="text-lg font-bold mb-2">Want to try it? login with:</h2>
        <p>
          Email: <code>john@gym.com</code>
        </p>
        <p>
          Password: <code>Abcd1234</code>
        </p>
      </div>
     
     </section>
    )
     
}

export default HomeView