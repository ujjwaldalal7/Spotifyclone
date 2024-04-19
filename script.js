let currfolder;
let songs
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    return `${formattedMinutes}:${formattedSeconds}`;
}
async function fetchsong(folder) {
    currfolder=folder
    console.log(folder)
    let a = await fetch(`${currfolder}`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let a_s = div.getElementsByTagName("a")
    songs = []
    for (i = 0; i < a_s.length; i++) {
        const e = a_s[i]
        if (e.href.endsWith(".mp3")) {
            songs.push(e.href.split(`/${folder}/`)[1])
        }
    }
    console.log(songs)
    let UL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    UL.innerHTML=""
    for (const song of songs) {
        UL.innerHTML = UL.innerHTML + `<li>${song.replaceAll("%20"," ")}</li>`
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            playmusic(e.innerHTML)
        })})
}
let currentSong = new Audio();
const playmusic = (track) => {
    //let music=new Audio("/songs/"+track)
    console.log(track)
    currentSong.src = `${currfolder}/` + track
    currentSong.play()
    let button = document.getElementById("play")
    button.innerHTML = `<img src="pause.svg"></img>`

    let name = document.querySelector(".songname")
    name.innerHTML = track.replaceAll("%20", " ")
    console.log(track.replaceAll("%20", " "))

    currentSong.addEventListener("ended", () => {
        console.log(encodeURIComponent(track))
        let currentSongIndex = songs.indexOf(encodeURIComponent(track));
        let nextSongIndex = (currentSongIndex + 1);
        if(nextSongIndex<songs.length){
        playmusic(songs[nextSongIndex]);}
    });
}
async function album(){
    let a = await fetch("http://localhost:5500/songs/")
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchor=div.getElementsByTagName("a")
    let array=Array.from(anchor)
    for(i=0;i<array.length;i++){
        const e=array[i]
        if(e.href.includes("/songs/")){
            let folder=e.href.split("/songs/")[1]
            let foldername=decodeURIComponent(folder)
            console.log(foldername)
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response =await a.json()
            console.log(response)
            let container=document.querySelector(".cardcontainer")
            container.innerHTML+=`<div data-folder="${foldername}" class="card">
            <div class="play">
                <img src="play.svg" alt="">
            </div>
            <img src="http://127.0.0.1:5500/songs/${folder}/cover.jpg" alt="">
            <div class="name">${response.title}</div>
            <p>${response.description}</p>
        </div>`
        }}
}

async function main() {
    await album()
        play.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play()
                let button = document.getElementById("play")
                button.innerHTML = `<img src="pause.svg"></img>`
            }
            else {
                currentSong.pause()
                let button = document.getElementById("play")
                button.innerHTML = `<img src="play.svg"></img>`
            }
        })
        
        currentSong.addEventListener("timeupdate", () => {
            let time = document.querySelector(".duration")
            time.innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
            document.querySelector(".seekbar").querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
            if (currentSong.currentTime == currentSong.duration) {
                let button = document.getElementById("play")
                button.innerHTML = `<img src="play.svg"></img>`
            }
        })

        let seek = document.querySelector(".seekbar")
        seek.addEventListener("click", (m) => {
            currentSong.currentTime = ((m.offsetX) / m.target.getBoundingClientRect().width) * currentSong.duration

        })

        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = 0;
        })

        document.querySelector("#close").addEventListener("click", () => {
            document.querySelector(".left").style.left = -100 + "%";
        })
    

previous.addEventListener("click", () => {
    let currentSongIndex =songs.indexOf(currentSong.src.split(`${currfolder}/`)[1])

    if (currentSongIndex>0 && currentSongIndex<=songs.length) {
        currentSongIndex = currentSongIndex-1;
    }
    else{
        currentSongIndex=0;
    }
    playmusic(songs[currentSongIndex]);
})

next.addEventListener("click", () => {
    let currentSongIndex =songs.indexOf(currentSong.src.split(`${currfolder}/`)[1])
    console.log(currentSongIndex)
    if (currentSongIndex>=0 && currentSongIndex<songs.length) {
        currentSongIndex = currentSongIndex+1;
    }
    else{
        currentSongIndex=0;
    }
    playmusic(songs[currentSongIndex]);
})
 document.querySelector("#volume").addEventListener("change",(e)=>{
    currentSong.volume=parseFloat((e.target.value)/100)
})

Array.from(document.getElementsByClassName("card")).forEach((e)=>{
    e.addEventListener("click",async item=>{
        console.log(item.currentTarget.dataset.folder)
        fetchsong(`songs/${encodeURIComponent(item.currentTarget.dataset.folder)}`)
    })
})

}
main()
