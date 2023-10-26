import React, { useEffect, useState } from 'react';
import * as speechCommands from '@tensorflow-models/speech-commands';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs';
export const TFSpeechCommandPrediction = () => {
 
    const [prediction, setPrediction] = useState<Float32Array|Float32Array[]>(new Float32Array().fill(0));
    const [labels, setLabels] = useState<string[]>([])
    

    async function setupModel() {
        // const URL = `${window.location.toString()}/js/noise_prediction/`;
        // const modelURL = `${URL}model.json`;
        // const metadataURL = `${URL}metadata.json`;
        // console.log(modelURL)
        // console.log(metadataURL)
        const model = speechCommands.create('BROWSER_FFT');
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
    
    // @ts-ignore
    const actualPrediction =labels
        .map((label, i) => {
            const value = Math.floor(prediction[i] as number * 100);
            return {label, value};
        })
        .filter((p) => p.value > 80)
        .filter((p) => !p.label.includes('_background_noise_') &&  !p.label.includes('_unknown_'));

     return <div  className='pt-5' >
        <h2 className='text-2xl font-extrabold' > Audio Command Prediction </h2>
        <div>

            <div>Say one of this commands: {labels.filter((label) => !label.includes('_background_noise_') &&  !label.includes('_unknown_')).join(' | ') }</div>
            <div> You are saying: {actualPrediction.length 
                ? actualPrediction.map(({label}) => (<span key={label} >{label}</span>))
                : <span className='text-gray-500' >nothing</span>
            } 
            </div>
            {/* <LabelListPrediction labels={labels} prediction={prediction} /> */}
            {/* {JSON.stringify(actualPrediction, null, 2)} */}
            {!labels.length && <div> Loading model... </div>}
            
            
        </div>
     </div>

};

const LabelListPrediction = ({labels, prediction} : {labels: string[], prediction: Float32Array|Float32Array[]}) => {
    return labels.map((label, i) => {
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
    });
};