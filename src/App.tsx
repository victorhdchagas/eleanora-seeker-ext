import {useState, useEffect} from 'react';
import './App.css'
import EleanoraLogo from './assets/Eleanora-seeker-logo.png'
function App() {
    const [url,setUrl] = useState("")
    const [status,setStatus] = useState(false)

    const checkServerHealth = async (url:string)=>{
        try {
            const urlInstance = new URL(url)
    
            const response = await fetch(urlInstance.href+'/ping',{
                method:"POST",
            })
            return response.status==200
            
        } catch (error) {
            console.log('error happened code 201')
        }
        return false;
    }

    useEffect(()=>{
        chrome.storage.sync.get(async (items)=>{
            setUrl(items.url)
            console.log(items.url)
            setStatus(await checkServerHealth(items.url))
        })
    },[])

    const update= async (e:React.FormEvent)=>{
        e.preventDefault()
        chrome.storage.sync.set({url});
        setStatus(await checkServerHealth(url))
    }

    return (
        <form className={"w-full flex flex-col gap-2"} onClick={update}>
            <img src={EleanoraLogo} className="w-full"/>

            <h2 className="text-md ">
                Insert eleanora endpoint
            </h2>
            <input type="url"
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inline-full-name"
            placeholder='http://localhost:62236' onChange={(e)=>setUrl(e.target.value)} value={url}/>
            <button type="submit"
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded-md  active:bg-blue-800"
            value="Enviar">
                Enviar
            </button>
            <span>Status: <span className={"ball ".concat(status?'b-ok':'b-error')}></span></span>
        </form>
    )
}

export default App
