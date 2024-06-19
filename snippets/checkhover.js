import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { XCircleIcon as XCircleIconSolid } from '@heroicons/react/24/solid'
import { XCircleIcon as XCircleIconOutline } from '@heroicons/react/24/outline'
const CloseIcon = (
    {
        className,
        onClick,
    }
) => {
    const [hovered,setHovered] = useState(false);
    const closeRef = useRef()

    const checkHover = (e => {
      if (closeRef.current) {
        const mouseOver = closeRef.current.contains(e.target);
        if (!hovered && mouseOver) {
          console.log(hovered,mouseOver);
          setHovered(true)
        }
  
        if (hovered && !mouseOver) {
          setHovered(false)
        }
      }
    });
    useEffect(() => {
      window.addEventListener("mousemove", checkHover, true);
      return () => {
        window.removeEventListener("mousemove", checkHover, true);
      }
    },[hovered])
    return (
        <div 
            id='123'
            className='w-[24px] h-[24px]'
            onMouseEnter={(e)=>{e.preventDefault();setHovered(true)}}
            onMouseLeave={(e)=>{e.preventDefault();setHovered(false)}}
        >  
          <div 
            ref={closeRef}
          >
            {hovered ?
            <XCircleIconSolid className={className} onClick={onClick}/>: <XCircleIconOutline className={className} onClick={onClick}/> 
            }
          </div>
        </div>
    )
    
}
export default CloseIcon