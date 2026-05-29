import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router"
import SessionsListView from './sessions/SessionsListView.jsx'
import Layout from './common/Layout.jsx'
import { AuthenticationProvider } from './authentication/useAuthenticate.jsx'
import HomeView from './users/HomeView.jsx'
import LoginView from './authentication/LoginView.jsx'
import RegisterView from './authentication/RegisterView.jsx'
import PostsListView from './posts/PostsListView.jsx'
import MemberBookingsView from './bookings/MemberBookingsView.jsx'
import TrainerBookingsView from './bookings/TrainerBookingsView.jsx'
import BookingsListView from './sessions/BookingsListView.jsx'
import ProfileView from './users/ProfileView.jsx'



const router = createBrowserRouter([   //accept array of your routes objects
  {
    Component: Layout, //prent component
    children:[
      {
        index: true,    //Homepage
        Component: HomeView //component
      },
      {
        path: "/login",    //login
        Component: LoginView //component
      },
      {
        path: "/register",    //register
        Component: RegisterView//component
      },
            {
        path: "/posts",    //blog
        Component: PostsListView //component
      },      
      {
        path:"/sessions", //Calendar view
        Component: SessionsListView
      },
      {
      path:"/bookings", //Booking details
        Component: BookingsListView  
      },
      {
        path:"/member", //member bookings
        Component: MemberBookingsView
      },
      {
        path:"/trainer", //trainer view
        Component: TrainerBookingsView //trainer bookings (with comp)
      },
      { path:"/profile", //profile view
        Component: ProfileView//Profile View
      },



    ]
  },
  
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <AuthenticationProvider>
  {/* Router provider: read router configuration and decide which to show based on url */}
  {/* You can add any components before or after the router */}
    <RouterProvider router={router}/>
  </AuthenticationProvider>
  </StrictMode>,
)
