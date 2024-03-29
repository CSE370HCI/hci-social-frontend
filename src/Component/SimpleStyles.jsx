import React, {useEffect, useState} from "react";

export default function SimpleStyles(){

    // say you have situation where you want to control
    // what user page gets rendered based on how state changes
    // upon some navigatory action by the user
    const [open, setOpen] = useState(false)
    return(
        <>
        {open==true ? 
        <div style={{
            position:"absolute",
            backgroundColor:"pink",
            width:"40vw",
            height:"40vh",
            borderRadius:"20px",
            marginLeft:"30%",
        }}> 
        <button onClick={() => setOpen(!open)}>x</button>
        </div>
        :null}
        <div>
        <button onClick={() => setOpen(!open)}>
            Click me!
        </button>
        </div>
        </>
    )

}

// a VERY basic profile card
function Profile ({data}){      
    // basically just display a div stuffed with data prop  
    return (
        <div>
            My email is {data.email}<br></br>
            {data.bio}<br></br>
            {/* peep conditional styling here */}
            My favorite color is <span style={{color:data.color}}>{data.color}</span>
            <br></br>
        </div>
    )
}

// A VERY simple button dispaying the name
function Name(props){  
    // use borrowed setter from parent to 
    // influence how other components render
    const handleClick = () => {
        props.setSelected(props.name)
    }
    return (
        <button style={{textAlign:"center", margin:"auto", width:"100%"}} onClick={handleClick}>{props.data}</button>
    )
}


function Counter(){
	const [count, setCount] = useState(0);
	const increase = () => {
		setCount(count+1)
    }

    const decrease = () => {
		setCount(count-1)
    }
    return (
        <>
            <h2>{count}</h2>
            <button onClick={increase}> Increase </button>
            <CounterComponent count={count} decrease={decrease}/>
        </>
    )
        
}

function CounterComponent(props){
    return (
        <>
            <button onClick={props.decrease}> Decrease </button>
        </>
    )      
}

function List(){
    const data = ['daisy', 'rose', 'carnation', 'marigold']
    return(
        <>
            {data.map(flower => <li>{flower}</li>)}
        </>
    )
}

function ListItem(props){
    return(
        <li style={{color:props.color}}>{props.flower}</li>
    )
}

function Toggled(props){
    return(
        <>
        {props.display == true? <List/> : null}
        </>
    )
}

function ComplicatedList(){
    const data = 
    [
        {fav: true,flower: 'daisy',color: "yellow"}, 
        {fav: false, flower:'rose', color:"red"}, 
        {fav: true, flower:'carnation', color:"pink"}, 
        {fav: false,flower: 'marigold',color: "orange"}
    ]

    const [display, setDisplay] = useState(true);
    const [displayText, setText] = useState("Hide ");

    const toggle = () => {
        if (display == false){
            setText("Hide ")
        } else {
            setText("Show ")
        }
        setDisplay(!display)
    }

    return(
        <>
            <button onClick={toggle}> {displayText} Plain List</button>
            <Toggled display={display} data={data}/>
            <h2> Here are the ones I like from the list: </h2>
            {data.map(flower => flower.fav && <ListItem 
                flower={flower.flower}
                color={flower.color}
                />
            )}
        </>
    )
}
