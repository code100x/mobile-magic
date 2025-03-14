'use client'

import { motion } from 'motion/react'
import { containerVariants, itemVariants } from '@/lib/animation-variants'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const Hero = () => {
	const router = useRouter();

	useEffect(() => {
    		const urlParams = new URLSearchParams(window.location.search);
    		const githubToken = urlParams.get("githubToken");
    		const githubId = urlParams.get("githubId");
    		const githubUsername = urlParams.get("githubUsername");

    		if (githubToken && githubId && githubUsername) {
     		 localStorage.setItem("githubToken", githubToken);
      		 localStorage.setItem("githubId", githubId);
      		 localStorage.setItem("githubUsername", githubUsername);
    		}
    		router.push("/");
  	}, [router]);
	
	return (
	   <motion.div
	     variants={containerVariants}
	     initial="hidden"
	     animate="visible"
	   >
              <motion.h1 variants={itemVariants} className="text-center text-3xl font-medium tracking-tighter sm:text-5xl drop-shadow-sm">
                Bring your imagination to life
              </motion.h1>

              <motion.div variants={itemVariants} className="group flex items-center justify-center">
                <p
                  className="mt-4 w-fit rounded-full text-center border border-teal-300/30 dark:border-teal-200/10 font-semibold bg-teal-100 dark:bg-teal-200/5 tracking-wide text-teal-400/80 dark:text-teal-300/70 px-4 py-1 transition-all duration-300 ease-in-out"
                >
                  Prompt, click generate and watch your app come to life
                </p>
              </motion.div>
	   </motion.div>
	)	
}
