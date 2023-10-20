"use client";

import React, { useEffect, useState } from 'react';
import Script from 'next/script'
import Select, { components } from "react-select";

type AudioFilterNames = "lowpass" | "noisereduction"

const options: {label: string, value: AudioFilterNames}[] = [
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

export const AudioDemo = () => {
    <>
      <Script src="/js/low_pass_filter_worker.js" strategy="worker" />
    </>

    const analyserCanvas: any = React.useRef(null);
    const audioTag = React.useRef<HTMLAudioElement>(null);
    const [started, setStarted] = useState(false);
    const [filter, setFilter] = useState<AudioFilterNames | undefined>('lowpass')
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
        <div>
            <h1>Audio Demo</h1>
            <Select
                options={options}
                onChange={(opt) => setFilter(opt?.value)}
                />
            filter: {filter} | {started.toString()}

            <button onClick={() => audioStartStop()} >Play</button>
            <audio ref={audioTag} controls={true} autoPlay >hello</audio>
            {/* <canvas ref={analyserCanvas} className=""></canvas> */}
        </div>
    );
};

