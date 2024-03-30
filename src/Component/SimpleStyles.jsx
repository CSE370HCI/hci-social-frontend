import React, {useEffect, useState} from "react";
import davishall from "../assets/davishall.jpg"

export default function SimpleStyles(){
    const [filter, setFilter] = useState("")
    const [numeric, setNumeric] = useState("0")
    const [filterVal, setClass] = useState("")
    const [defaults, addDefault] = useState({current:[], new: null})

    const filterOpts = {
        "blur":"blur(5px)",
        "brightness":"brightness(0.4)",
        "contrast":"contrast(200%)",
        "drop-shadow":"drop-shadow(16px 16px 20px blue)",
        "grayscale":"grayscale(50%)",
        "hue-rotate":"hue-rotate(90deg)",
        "invert":"invert(75%)",
        "opacity":"opacity(25%)",
        "saturate":"saturate(30%)",
        "sepia":"sepia(60%)",
    }

    const specialUnits = {
        "blur": "px",
        "hue-rotate": "deg",
        "drop-shadow":"px 16px 20px blue"
    }

    useEffect(()=>{
        if (!defaults.new){
            return
        }
        if (defaults.current.includes(defaults.new)){
            let mix = ""
            let newCurrent = []
            for (let c of defaults.current){
                if (c != defaults.new){
                    mix += c + " "
                    newCurrent.push(c)
                }
            }
            setClass(mix == "" ? "none":mix)
            addDefault({current:[...newCurrent], new:null})
            return
        }
        let mix = ""
        for (let c of defaults.current){
            mix += c + " "
        }
        mix += defaults.new
        setClass(mix)
        addDefault({current:[ ...defaults.current, defaults.new], new:null})
    },[defaults])

    useEffect(()=>{
        let unit = specialUnits[filter] ? specialUnits[filter] : "%"
        console.log(`${filter}(${numeric}${unit})`)
        setClass(`${filter}(${numeric}${unit})`)

    }, [numeric, filter])

    return(
        <>
        <div>
            <p>Applying: {filterVal}</p>

        <div>
            {filterVal ? <img style={{filter: filterVal}} width={"32%"} height={"90%"} src={davishall}></img>:null}
        </div>

        <div>
            {Object.entries(filterOpts).map(key => <button onClick={() => setFilter(key[0])}> {key[0]} </button>)}
        </div>

        <p>Adjust the filter with:</p>
        <div>
            <input onChange={(e) => {
                console.log(e.target.value.toString())
                setNumeric(e.target.value.toString())}}
            type="range" min="1" max="200" value={numeric?numeric:0} class="slider" id="myRange"></input>
        </div>

        <p>Stack some defaults! (Click again to remove)</p>
        <div>
        {Object.entries(filterOpts).map(key => <button onClick={() => addDefault({current:defaults.current, new:key[1]})}> {key[0]} </button>)}
        </div>

        </div>
        </>
    )
}

