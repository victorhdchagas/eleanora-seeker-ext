function youtubeScriptCallback(){
    const toSearch = ()=>{
        const {href,title} = document.querySelector("#owner #channel-name #text a")
        return {href,title}
    }
    const script = `(${toSearch})()`
    const onSuccess = function(data){
        return data.title
    }

    return {script,onSuccess}
}

function Injector(url){
    const Injector = {
        "www.youtube.com":youtubeScriptCallback
    }
    const Url = new URL(url);
    
    if(Injector[url])return Injector[Url.host]()
    
    return {
        script:null,
        onSuccess:()=>{}
    }
}

export default Injector