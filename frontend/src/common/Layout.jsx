import {FaLock} from "react-icons/fa"
import {TbLogout} from "react-icons/tb"
import { FcPrivacy } from "react-icons/fc";
import { IoPerson } from "react-icons/io5";
import { Outlet, useNavigate, useLocation, Link } from "react-router"
import { MdSportsGymnastics } from "react-icons/md";
import { CgGym } from "react-icons/cg";
import { GiGymBag } from "react-icons/gi";
import { SiOpenaigym } from "react-icons/si";
import { FaMicroblog } from "react-icons/fa6";
import { useAuthenticate } from "../authentication/useAuthenticate";


function Layout(){
    const navigate = useNavigate()
    const location = useLocation() //what page we are currently on 
    const {user,logout} = useAuthenticate()////check

   //flex flex-col 
    return <main className="max-w-[430px] min-h-screen mx-auto shadow">
         <header className="navbar justify-between  shadow-md bg-black text-yellow-400">
            <button  
                onClick={()=>navigate("/")}
                className="btn btn-ghost text-lg ">
                 Hi Street Gym
            </button>
            {user
            ?<button 
                onClick={()=>logout()}
                 className="btn btn-ghost text-lg">
                 <TbLogout className="text-yellow-400"/>  
            </button>
            
            :<button 
                onClick={()=>navigate("/login")}
                 className="btn btn-ghost text-lg">
                 <FaLock className="text-yellow-400"/>  
            </button>
        
        }

        </header>
        
        <div className="px-4 py-2 pb-20 overflow-auto">
            <Outlet /> 
        </div>
   
        {user && <nav className="dock max-w-[430px] mx-auto  z-10 text-yellow-400 bg-black">
            
            {user && user.role =="member" && <><button
            onClick={()=>navigate("/sessions")}
            className={location.pathname ==  "/sessions" ? "dock-active": ""}>
            <CgGym  className="text-2xl"/>
            <span className="dock-label">sessions</span>
            </button>

            <button
            onClick={()=>navigate("/member")} //Update remove number
            className= {location.pathname.startsWith("/member") ? "dock-active": "" }>
            <GiGymBag  className="text-2xl"/>
            <span className="dock-label">Bookings</span>
            </button></>
            }

            {user && user.role == "trainer" && <button
            onClick={()=>navigate("/trainer")} //Update remove number
            className= {location.pathname.startsWith("/trainer") ? "dock-active": "" }>
            <MdSportsGymnastics  className="text-2xl"/>
            <span className="dock-label">Bookings</span>
            </button>}

            <button
            onClick={()=>navigate("/posts")}
            className= {location.pathname.startsWith("/blog")   ? "dock-active":"" }>
            <FaMicroblog className="text-2xl" />
            <span className="dock-label">Blog</span>
            </button>

            <button
            onClick={()=>navigate("/profile")}
            className= {location.pathname.startsWith("/profile") ?"dock-active":"" }>
            <IoPerson className="text-2xl" />
            <span className="dock-label">Profile</span>
            </button>
           
            <button
            onClick={() => window.open("https://tafeqld.edu.au/legal/privacy-policy", "_blank")}
            className={ window.location.href == "https://tafeqld.edu.au/legal/privacy-policy" ? "dock-active" : ""}>
            <FcPrivacy className="text-2xl" />
            <span className="dock-label">Privacy policy</span>
            </button>
            
        </nav>}
     
  

        
    </main>

}

export default Layout