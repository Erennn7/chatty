import {create} from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import {io} from "socket.io-client";


const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : import.meta.env.VITE_BACKEND_URL || "/";


export const useAuthStore = create((set,get)=>({
    authUser:null,
    isSigningUp :false,
    isLoggingIn: false,
    isUpdatingProfile:false,
    onlineUsers: [],
    isCheckingAuth:true,
    socket:null,

    checkAuth:async()=>{
        try{
            const res = await axiosInstance.get("/auth/check");

            set({authUser:res.data})
            get().connectSocket();
        }catch(error){
            set({authUser:null})
            console.log("Error in checking auth",error);
        }finally{
            set({isCheckingAuth:false})
        }
    },

    signup:async (data)=>{
        set({isSigningUp:true});
        try{
            const res = await axiosInstance.post("/auth/signup",data);
            set({authUser:res.data});
            toast.success("Account created successfully");
            get().connectSocket();
        }catch(err){
            toast.error(err.response.data.message || "Something went wrong");
        }finally{
            set({isSigningUp:false});
        }
    },
    
    login:async(data)=>{
        try{
            set({isLoggingIn:true});
            const res = await axiosInstance.post("/auth/login",data);
            set({authUser:res.data});
            toast.success("Logged in successfully");
            get().connectSocket();
        }catch(err){
            toast.error(err.response.data.message || "Something went wrong");
        }finally{
            set({isLoggingIn:false});
        }
    },
    logout:async()=>{
        try{
            await axiosInstance.post("/auth/logout");
            set({authUser:null});
            toast.success("Logged out successfully");
            get().disconnectSocket();
        }catch(err){
            toast.error(err.response.data.message );
        }
    },

    updateProfile:async(data)=>{
        set({isUpdatingProfile:true});
        try{
            const res = await axiosInstance.put("/auth/update-profile",data);
            set({authUser:res.data});
            toast.success("Profile updated successfully");
        }catch(err){
            console.log("Error in updating profile",err);
            toast.error(err.response.data.message );
        }finally{
            set({isUpdatingProfile:false});
        }
    },

    connectSocket:()=>{
        const {authUser} = get();
        if(!authUser || get().socket?.connected) return;   //check if user is logged in and socket is not connected

        const socket= io(BASE_URL,{
            query:{
                userId:authUser._id,
            },
        })
        socket.connect();
        set({socket:socket});
        socket.on("getOnlineUsers",(userIds)=>{
            set({onlineUsers:userIds});
        })
    },

    disconnectSocket: ()=>{
        if(get().socket?.connected) get().socket.disconnect();
    }
}))