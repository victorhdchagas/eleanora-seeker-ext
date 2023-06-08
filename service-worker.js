
function mountParam(url){
    return `${url.protocol}//${url.hostname}${url.port?":"+url.port:""}${url.pathname}${url.search}`
}

function mountPostBody(urls){
    return urls.map(url=>mountParam(url))
}

// let latestSend = []
function latestSend(){
    const set = async(latestSend)=>{
        const data = await chrome.storage.sync.get(latestSend)
        await chrome.storage.sync.set({...data,latestSend})
    }
    const get = async (latestSend)=>{
        const toReturn = await chrome.storage.sync.get(latestSend);
        return toReturn[latestSend]
    }

    return {set,get}
}

async function sendRequest(endpoint,urlList){
    const toSend = {urlList,latestSend:await latestSend().get("latestSend")}
    const response =await fetch(endpoint,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(toSend)
    });
    await latestSend().set(urlList);
    return response.status

}

chrome.tabs.onActivated.addListener(async ( {tabId})=>{
    const sendingEndpoint = await chrome.storage.sync.get("url")
    if(!sendingEndpoint || sendingEndpoint.url.length==0) return;
    const allTabs = await chrome.tabs.query({active:true})
    const activatedTab = allTabs.find(t=>t.id==tabId)
    const listeningTabs = await chrome.tabs.query({audible:true})
    if(activatedTab && activatedTab.url.length>0){
        try {
            const activateUrl = new URL(activatedTab.url)
            const toSend = mountPostBody([activateUrl, ].concat(listeningTabs.map(t=>new URL(t.url))))
            await sendRequest(sendingEndpoint.url,toSend)
            
        } catch (error) {
            console.error("Non url supplied",error)
        }
    }

})
