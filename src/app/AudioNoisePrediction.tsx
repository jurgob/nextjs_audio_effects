import React, { useEffect, useState } from 'react';
import * as speechCommands from '@tensorflow-models/speech-commands';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs';

export const AudioNoisePrediction = () => {
    const labels = [
        "Brushing teeth",
        "Coughing",
        "Phone ringing",
        "Speaking",
        "Typing",
        "_background_noise_"
      ]

    const [prediction, setPrediction] = useState<Float32Array|Float32Array[]>(new Float32Array(labels.length).fill(0));
    

    async function setupModel() {
    
        //store the prediction and audio callback functions
        // const predictionCallback = predictionCB;
        const URL = "http://localhost:3000/js/noise_prediction/";
        const modelURL = `${URL}model.json`;
        const metadataURL = `${URL}metadata.json`;
        console.log(modelURL)
        console.log(metadataURL)
        const model = speechCommands.create('BROWSER_FFT', undefined, modelURL, metadataURL);
        await model.ensureModelLoaded();
     
        const modelParameters : speechCommands.StreamingRecognitionConfig= {
            invokeCallbackOnNoiseAndUnknown: true, // run even when only background noise is detected
            includeSpectrogram: true, // give us access to numerical audio data
            overlapFactor: 0.5 // how often per second to sample audio, 0.5 means twice per second
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

     return <div>
        <h2> Audio Noise Prediction </h2>
        <div>
            {labels.map((label, i) => {
                const value = prediction[i] as number * 100;
                return (
                    <div key={i} className='pt-1 pb-1'>
                        <div>{label}</div>
                        <div  className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                            <div 
                                className="bg-blue-600 text-lg font-medium text-blue-100text-key={i} center p-0.5 leading-none rounded-full" 
                                style={{width: `${Math.floor(value)}%`}}> {`${Math.floor(value)}%`}
                            </div>
                        </div>
                    </div>
                );
            })
            }
            
        </div>
     </div>

};

