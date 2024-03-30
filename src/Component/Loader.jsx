import { useState } from "react"

function Spacer(){
    return(
        <>
        <br></br>
        <br></br>
        </>
    )
}

export default function Loader(){
    const [loading, setloading] = useState("spin")
    return (
        <>
        <Spacer/>
        Whoah, look at it go!
        <Spacer/>
        <svg
        className={loading}
        xmlns="http://www.w3.org/2000/svg"
        style={{ margin: "auto" }}
        width="100"
        height="100"
        display="block"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 100 100">
            <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="#e15b64"
            strokeDasharray="164.93361431346415 56.97787143782138"
            strokeWidth="10">
            </circle>
        </svg>

        <Spacer/>
        <div>
            <button onClick={() => setloading("")}>
                Stop Loading
            </button>
            <button  style={{
                marginLeft:"20px"
            }} onClick={() => setloading("spin")}>
                Start Loading
            </button>
        </div>
        </>
    )
}