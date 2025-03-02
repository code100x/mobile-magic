"use client"
import React from 'react';
import styled from 'styled-components';
import {Loader} from "@/components/Loader"

const Loading = () => {
  return (
    <div className='flex h-screen w-screen items-center justify-center '>
       <Loader />
    </div>
  );
}

export default Loading
