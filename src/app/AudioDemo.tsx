"use client";

import React, { useEffect, useState } from 'react';
import Script from 'next/script'




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

    useEffect(() => {
            const audioTest = async () => {
            if(started) return;
            setStarted(true);


            console.log('audio')
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
                    }

                }catch (err) {
                    console.error(err);
                }
            }
        }
        // setTimeout(()=> {
        //     audioTest()
        // }, 500)
        audioTest()
    }, [started]);

    return(
        <div>
            <h1>Audio Demo</h1>
            <audio ref={audioTag} controls={true} autoPlay >hello</audio>
            {/* <canvas ref={analyserCanvas} className=""></canvas> */}
        </div>
    );
};

