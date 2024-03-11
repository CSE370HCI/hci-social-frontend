import React, {useEffect, useState} from "react";

export default function SimplePage(){

    // say you have situation where you want to control
    // what user page gets rendered based on how state changes
    // upon some navigatory action by the user
    const users = {
        "797":"Harley",
        "798":"Haley",
        "799":"Steve",
        "801":"Emily",
    }

    // state to keep track of which user page to deplay
    const [selected, setSelected] = useState(null)

    // state to keep track of fetched data
    const [data, setData] = useState({})

    // reload fetched data everytime selected changes
    useEffect(() => {
        fetch(process.env.REACT_APP_API_PATH + `/users/${selected}`)
        .then(res => res.json())
        .then(res=>{
            // set the data
            setData(res.attributes.name)
        })
    }, [selected])

    return(
        <>
        <div style={{display:"flex", marginLeft: "25vw", height:"50%", width:"80%"}}>
            <div style={{height:"30px", width:"60px", display:'flex', flexDirection:"column",gap:"10px", marginRight:"15px"}}>
                {/* for each key of users map is to a button for navigation */}
                {Object.entries(users).map(([id, name]) =>  <Name name={id} data={name} setSelected={setSelected}/>)}
            </div>
            {/* is a page is active, display the profile */}
            {selected ? 
                <Profile data={data}/>
            : null }
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
