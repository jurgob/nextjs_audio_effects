"use client";

import React, { useEffect, useState } from 'react';
import Select, { components } from "react-select";
import Script from 'next/script'

type AudioFilterNames = "lowpass" | "noisereduction" | "none"

const options: {label: string, value: AudioFilterNames }[] = [
    { label: "no effect", value: "none" },
    { label: "Low Filter Pass", value: "lowpass" },
    { label: "Noise Reduction", value: "noisereduction" },
];


const lowPassFilter = (stream:MediaStream): MediaStream => {
    const audioTracks = stream.getAudioTracks();
    // const processor1 = new MediaStreamTrackProcessor()
    const processor = new MediaStreamTrackProcessor({track: audioTracks[0]});
    const generator = new MediaStreamTrackGenerator({kind: 'audio'});
    const source = processor.readable;
    const sink = generator.writable;
    const worker = new Worker('/js/low_pass_filter_worker.js');
    worker.postMessage({source: source, sink: sink}, [source, sink]);

    const processedStream = new MediaStream();
    processedStream.addTrack(generator);
    return processedStream;

}


export const LowPassFilter = () => {
    <>
      <Script src="/js/low_pass_filter_worker.js" strategy="worker" />
    </>
    // setupModel();
    const analyserCanvas: any = React.useRef(null);
    const audioTag = React.useRef<HTMLAudioElement>(null);
    const [started, setStarted] = useState(false);
    const [filter, setFilter] = useState<AudioFilterNames>('none')
    const audioStartStop = async () => {
        if(started){
            if(audioTag.current && audioTag.current.srcObject){
                console.log('stopping')
                audioTag.current?.pause()
                audioTag.current.srcObject = null;
                setStarted(false);
            }
            return ;
        }

        if (navigator.mediaDevices.getUserMedia !== null) {

            const options = {
                video: false,
                audio: true,
            };
            try {
                const stream = await navigator.mediaDevices.getUserMedia(options);

                const processedStream = lowPassFilter(stream);
                // const processedStream = stream;

                if(audioTag.current && !audioTag.current.srcObject){
                    audioTag.current?.play()
                    audioTag.current.srcObject = processedStream;
                    setStarted(true)
                }

            }catch (err) {
                console.error(err);
            }
        }
    }

    return(
        <div  className='pt-5' >
            <h2 className='text-2xl font-extrabold' >Low Pass filter  </h2>
            <div>
                <div>filter: {filter} | {started.toString()}</div>
                <button onClick={() => audioStartStop()} >Play</button>
            </div>
            <audio ref={audioTag} controls={true} autoPlay onPlay={() => console.log('play')}  >hello</audio>
        </div>
    );
};

