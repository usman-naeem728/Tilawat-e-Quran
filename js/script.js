console.log('Lets write JavaScript');
let currentsur = new Audio();
let surs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsurs(folder) {
    currFolder = folder;
    console.log(folder)
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    surs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            surs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // console.log(surs)
 


    // Show all the surs in the playlist
    let surUL = document.querySelector(".surList").getElementsByTagName("ul")[0]
    surUL.innerHTML = ""
    for (const sur of surs) {
        surUL.innerHTML = surUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${sur.replaceAll("%20", " ")}</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    // Attach an event listener to each sur
    Array.from(document.querySelector(".surList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    return surs
}

const playMusic = (track, pause = false) => {
    currentsur.src = `/${currFolder}/` + track
    if (!pause) {
        currentsur.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".surinfo").innerHTML = decodeURI(track)
    document.querySelector(".surtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
    let a = await fetch(`/surahs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        // console.log(e.href,"kl")
        if (e.href.split('/').slice(4).length !== 0) {
            let folder = e.href.split("/").slice(4)
            // Get the metadata of the folder
            let a = await fetch(`/surahs/${folder}/info.json`)
            // console.log(folder)
            let response = await a.json(); 
            // console.log(response)
           
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="surahs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
       
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            // console.log("Fetching surs")
            surs = await getsurs(`surahs/${item.currentTarget.dataset.folder}`)  
            playMusic(surs[0])

        })
    })
}

async function main() {
    // Get the list of all the surs
    await getsurs("surahs/cs")
    playMusic(surs[0], true)

    // Display all the albums on the page
    await displayAlbums()


    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentsur.paused) {
            currentsur.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsur.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentsur.addEventListener("timeupdate", () => {
        document.querySelector(".surtime").innerHTML = `${secondsToMinutesSeconds(currentsur.currentTime)} / ${secondsToMinutesSeconds(currentsur.duration)}`
        document.querySelector(".circle").style.left = (currentsur.currentTime / currentsur.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsur.currentTime = ((currentsur.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentsur.pause()
        console.log("Previous clicked")
        let index = surs.indexOf(currentsur.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(surs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentsur.pause()
        console.log("Next clicked")

        let index = surs.indexOf(currentsur.src.split("/").slice(-1)[0])
        if ((index + 1) < surs.length) {
            playMusic(surs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentsur.volume = parseInt(e.target.value) / 100
        if (currentsur.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsur.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsur.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })





}

main() 