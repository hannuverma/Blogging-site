import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import LottieFile from '../assets/404error.lottie'; // Note the './'
const NotFound = () => {
  return (
    <div>
        <DotLottieReact src={LottieFile} loop autoplay />
    </div>
  )
}

export default NotFound
