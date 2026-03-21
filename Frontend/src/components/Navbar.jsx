import React, { useState } from 'react'

const Navbar = async () => {

    const [profilePicture, setProfilePicture] = React.useState(null);
    try {
        const response = await fetch('http://localhost:8000/api/user/profile-picture/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        const data = await response.json();
        setProfilePicture(data.profile_picture);
    } catch (error) {
        console.error('Error fetching profile picture:', error);
    }


  return (

        <nav className='flex items-center justify-between p-4 bg-white dark:bg-black '>

            <div className='flex items-center m-1'>
                {/* SVG Icon */}
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="25" 
                    height="25" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="lucide lucide-menu text-black dark:text-white hover:text-gray-500 transition-colors duration-100"
                >
                    <path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>
                </svg>

                <span className='ml-3 font-bold text-black dark:text-white text-[30px] tracking-tight'>
                    VoidBloggin
                </span>
                
                <input type="search" placeholder="Search..." className="ml-4 p-2 border border-gray-300 dark:border-gray-600 bg-[#F9F9F9] dark:bg-black text-black dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 
                h-[35px] border-1 rounded-2xl" />


            </div>

            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>

                <span>Write</span>

                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell-icon lucide-bell"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>

                <img src="https://via.placeholder.com/40" alt="Profile" className="ml-2 w-8 h-8 rounded-full" />
            </div>
        </nav>
  )
}

export default Navbar
