import "./audio.css"
import { FaPlay,FaPause,FaBackward,FaForward } from "react-icons/fa"
import { Song } from "./Songs"
import { Howl } from "howler"
import { useState, useEffect, useRef } from 'react'
export function Music():JSX.Element{
    const[duration,setDuration]=useState<number>(0)
    const[currentTime,setCurrenttime]=useState<number>(0)
    const[progress,setProgress]=useState<number>()
    const[mins,setMins]=useState<number>(0)
    const[secs,setSecs]=useState<number>(0)
    const[clock,setClock]=useState<string>('0:00')
    const [songIndex,setSongIndex]=useState<number>(0)
    const[isPlaying,setIsPlaying]=useState<boolean>(false)
    const songRef=useRef<Howl | null>(null)
    const intervalRef=useRef<number | null>(null)

    useEffect(()=>{
        if(songRef.current) {
            songRef.current.stop()
            songRef.current.unload()
        }

        songRef.current=new Howl({
            src:[Song[songIndex].song],
            html5:true,
            preload:true,
            onload:()=>{
                setDuration(songRef.current?.duration() || 0)
            },
            onplay:()=>{
                intervalRef.current=window.setInterval(()=>{
                 const seekTime=songRef.current?.seek() || 0
                 setCurrenttime(seekTime)
                 const minutes=Math.floor(seekTime/60)
                 setMins(minutes);
                 const seconds=Math.floor(seekTime%60)
                 setSecs(seconds)
                 setProgress(seekTime/(songRef.current?.duration() || 1)*100)
                })
            },
            onend:()=>{
                setMins(0)
                setClock("0:00")
                setSecs(0)
            }
        })
        songRef.current.play();
        return ()=>{
            if(intervalRef.current)  clearInterval(intervalRef.current)
            songRef.current?.stop()
            songRef.current?.unload()
        }
    },[songIndex])
    function playAndPause():void{
        if(songRef.current?.playing()){
            songRef.current.pause()
            setIsPlaying(false);}
         else{
            songRef.current?.play()
            setIsPlaying(true);
         }   
    }
    function handleRangeChange(e:React.ChangeEvent<HTMLInputElement>):void{
        const seekTime=Number(e.target.value)
        setCurrenttime(seekTime)
        if(songRef.current)
            songRef.current.seek(seekTime)
    }
    useEffect(()=>{
        setClock(`${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`)
    },[mins,secs])
    function nextSong():void{
        setSongIndex((cur) => (cur + 1) % Song.length);
        songRef.current?.play()
        setIsPlaying(true)
    }
    function previousSong():void{
      setSongIndex((cur) => (cur - 1 + Song.length) % Song.length);
       songRef.current?.play()
       setIsPlaying(true)
    }
    const box:React.CSSProperties={
        boxShadow:`3px 3px 5px whitesmoke`
    }
    return(
    <section className={`flex flex-col gap-y-2 w-[280px] sm:w-[500px] rounded-lg bg-[radial-gradient(#232323,gray,black)] 
    justify-center items-center`} style={box}>
      <div className={`w-full flex flex-col justify-center items-center`}>
        <img src={Song[songIndex].img} alt='song cover'
        className={` h-[200px] sm:h-[300px] rounded-lg mt-2`}/>
        <h1 className={`font-serif text-lg sm:text-2xl mt-1 text-[whitesmoke]`}>{Song[songIndex].title}</h1>
      </div>
      <div className={`w-full flex gap-x-[60%] sm:gap-x-[65%]`}>
        <h1 className={`font-mono text-md sm:text-lg text-[whitesmoke]`}>{clock}</h1>
        <h1 className={`font-serif text-sm text-[whitesmoke] `}>{Song[songIndex].artist}</h1>
      </div>
      <input 
      type="range"
      min={0}
      max={duration}
      value={currentTime}
      onChange={handleRangeChange}
     className={` w-full h-2 appearence-none rounded-lg`}
     style={
        {background:`linear-gradient(to right, whitesmoke ${progress}%, gray ${progress}% )`,}
    }
      /> 
      <div className={`w-full flex justify-evenly items-center mt-1`}>
        <FaBackward onClick={previousSong} className={`text-lg sm:text-xl text-[whitesmoke]`}/>
        {isPlaying?
        <FaPause onClick={playAndPause} className={`text-lg sm:text-xl text-[whitesmoke]`}/>
        :
        <FaPlay onClick={playAndPause} className={`text-lg sm:text-xl text-[whitesmoke]`}/>
        }
        <FaForward onClick={nextSong} className={`text-lg sm:text-xl text-[whitesmoke]`}/>
      </div>
    </section>)
}