
function mountParam(url){
    return `${url.protocol}://${url.hostname}${url.port?":"+url.port:""}${url.pathname}${url.search}`
}

function mountPostBody(urls){
    return urls.map(url=>mountParam(url))
}


async function sendRequest(endpoint,urlList){
    const response =await fetch(endpoint,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({urlList})
    });
    return response.status

}

chrome.tabs.onActivated.addListener(async ( {tabId})=>{
    const sendingEndpoint = await chrome.storage.sync.get("url")
    if(!sendingEndpoint || sendingEndpoint.url.length==0) return;
    const allTabs = await chrome.tabs.query({active:true})
    const activatedTab = allTabs.find(t=>t.id==tabId)
    const listeningTabs = await chrome.tabs.query({audible:true})
    console.log(sendingEndpoint.url)
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
