import type { ReactNode } from "react"

export function IconButton({
    icon,onClick,activated
}:{
    icon: ReactNode,
    onClick:()=> void,
    activated: boolean
}){
    return(
        <div 
            className={`
                m-2 
                cursor-pointer 
                rounded-lg 
                p-2 
                transition-colors
                duration-150
                ${activated 
                    ? "bg-[#4A4A4F] text-white border border-[#636363]" 
                    : "text-black hover:bg-[#4A4A4F40]"
                }
            `} 
            onClick={onClick}
        >
            {icon}
        </div>
    )
}