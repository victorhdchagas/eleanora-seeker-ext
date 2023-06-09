const newTab = {
    url: null
}
async function createToSend(tab) {
    const url = new URL(tab.url)
    return { title: await getTitle(tab, url), url: mountParam(url) }
}
function youtubeScriptCallback() {
    const script = () => {
        const data = document.querySelector("#owner #channel-name #text a")
        return data.innerHTML
    }
    const onSuccess = function (data) {
        if (data.length > 0)
            return data[0].result
        return null
    }

    return { script, onSuccess, name: "youtube" }
}

function Injector(url) {
    const Injector = {
        "www.youtube.com": youtubeScriptCallback
    }
    const Url = new URL(url);

    if (Injector[url.host]) return Injector[Url.host]()

    return {
        script: null,
        onSuccess: () => { }
    }
}

function mountParam(url) {
    return `${url.protocol}//${url.hostname}${url.port ? ":" + url.port : ""}${url.pathname}${url.search}`
}

function mountPostBody(urls) {
    return urls.map(url => mountParam(url))
}
async function getTitle(tab, url) {
    const injector = Injector(url);
    if (!injector.script) {
        return tab.title
    }
    const executing = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: false },
        func: injector.script
    },).then(injector.onSuccess);
    return executing + " - " + tab.title || tab.title;
}

function latestSend() {
    const set = async (latestSend) => {
        const data = await chrome.storage.sync.get(latestSend)
        await chrome.storage.sync.set({ ...data, latestSend })
    }
    const get = async (latestSend) => {
        const toReturn = await chrome.storage.sync.get(latestSend);
        return toReturn[latestSend]
    }

    return { set, get }
}

async function sendRequest(endpoint, toSend) {
    // const toSend = { urlList, latestSend: await latestSend().get("latestSend") }
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(toSend)
    });
    return response.status

}
function debounce(func, timeout = 500) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

//Usado pra gerenciar o status se o audio é disponivel ou nao
chrome.tabs.onUpdated.addListener(async (tabId, data, tab) => {
    if (data.status == 'loading')
        if (data.url && data.url.length > 0 && !(data.url.startsWith("chrome:/") || data.url.startsWith("vivaldi:/"))) {
            if (data.url !== newTab.url) {
                const toSend = await createToSend(tab)
                const sendingEndpoint = await chrome.storage.sync.get("url")

                await sendRequest(sendingEndpoint.url + "/new-tab", toSend)
                newTab.url = data.url
            }
            return;
        }
    if (Object.keys(data).indexOf("audible") > -1 || (data.mutedInfo && Object.keys(data.mutedInfo).indexOf("muted") > -1)) {
        try {
            const sendingEndpoint = await chrome.storage.sync.get("url")
            newTab.url = tab.url

            if (!sendingEndpoint || sendingEndpoint.url.length == 0) return;
            const muted = tab.mutedInfo.muted;
            const validatingByMuted = data.mutedInfo && Object.keys(data.mutedInfo).indexOf("muted") > -1
            const toSend = await createToSend(tab)
            if (validatingByMuted)
                toSend.listening = !muted
            else
                toSend.listening = tab.audible
            await sendRequest(sendingEndpoint.url + "/audio", toSend)

        } catch (error) {
            console.error("error on update", error)
        }
    }
})
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    const sendingEndpoint = await chrome.storage.sync.get("url")
    if (!sendingEndpoint || sendingEndpoint.url.length == 0) return;
    const allTabs = await chrome.tabs.query({ active: true })
    const activatedTab = allTabs.find(t => t.id == tabId)

    if (activatedTab && activatedTab.url.length > 0) {
        try {
            newTab.url = activatedTab.url
            const toSend = await createToSend(activatedTab);
            await sendRequest(sendingEndpoint.url, { actual: toSend, latestSend: await latestSend().get("latestSend") })
            await latestSend().set(toSend);

        } catch (error) {
            console.error("error on activate", error)
        }
    }

})
