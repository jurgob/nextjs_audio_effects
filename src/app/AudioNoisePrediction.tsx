import React, { useEffect, useState } from 'react';
import * as speechCommands from '@tensorflow-models/speech-commands';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs';
export const AudioNoisePrediction = () => {
 
    const [prediction, setPrediction] = useState<Float32Array|Float32Array[]>(new Float32Array().fill(0));
    const [labels, setLabels] = useState<string[]>([])
    

    async function setupModel() {
        const URL = `${window.location.toString()}/js/noise_prediction/`;
        const modelURL = `${URL}model.json`;
        const metadataURL = `${URL}metadata.json`;
        console.log(modelURL)
        console.log(metadataURL)
        const model = speechCommands.create('BROWSER_FFT', undefined, modelURL, metadataURL);
        await model.ensureModelLoaded();
        const words = model.wordLabels();
        setLabels(words);

        const modelParameters : speechCommands.StreamingRecognitionConfig= {
            invokeCallbackOnNoiseAndUnknown: true, // run even when only background noise is detected
            includeSpectrogram: true, // give us access to numerical audio data
            overlapFactor: 0.5 // how often per second to sample audio, 0.5 means twice per second, 
        };
        
     
        model.listen(
            //This callback function is invoked each time the model has a prediction.
            async (prediction) => {
                console.log(prediction.scores)
                setPrediction(prediction.scores)
                // predictionCallback(prediction.scores);
            },
            modelParameters
        );
     }

        useEffect(() => {
            setupModel();
        }, []);

     return <div  className='pt-5' >
        <h2 className='text-2xl font-extrabold' > Audio Noise Prediction </h2>
        <div>
            {!labels.length && <div> Loading model... </div>}
            {labels.map((label, i) => {
                const value = Math.floor(prediction[i] as number * 100);
                
                return (
                    <div key={i} className='pt-2 pb-2'>
                        <div className="flex justify-between mb-1">
                            <span className="text-base font-medium text-blue-700 dark:text-white">{label}</span>
                            <span className="text-sm font-medium text-blue-700 dark:text-white">{value}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${value}%`}}></div>
                        </div>
                    </div>
                );
            })
            }
            
        </div>
     </div>

};

