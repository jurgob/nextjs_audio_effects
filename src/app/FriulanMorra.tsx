
'use client'

import React, { useEffect, useState,useRef } from 'react';
import '@tensorflow/tfjs';
import * as speechCommands from '@tensorflow-models/speech-commands';


// const useDidMountEffect = (func:Function, deps: React.DependencyList) => {
//     const didMount = useRef(false);

//     useEffect(() => {
//         if (didMount.current) func();
//         else didMount.current = true;
//     }, deps);
// }


const prediction2Number: Record<string, number> = {
    'cinc':5,
    'dis':10,
    'doi':2,
    'dute':10,
    'issa':6,
    'nuf':9,
    'nuie':0,
    'quatri':4,
    'siet':7,
    'sis':6,
    'tre':3,
    'trrr':3,
    'un':1,
    'vot':8,
    'zero':0
}


export const FriulanMorra = () => {
 
    const [prediction,
         setPrediction] = useState<Float32Array|Float32Array[]>(new Float32Array().fill(0));
         const [predictionLabel,
            setPredictionLabel] = useState<string|undefined>(undefined);
    const [predictionHistory,
            setPredictionHistory] = useState<string[]>([])
    const [labels, setLabels] = useState<string[]>([])
    const [modelLoaded, setModelLoaded] = useState(false)
    

    async function setupModel() {
        if(modelLoaded) return;

        setModelLoaded(true)

        console.log('setupModel')
        const URL = `${window.location.toString()}/js/friulan-morra-audio-model/`;
        const modelURL = `${URL}model.json`;
        const metadataURL = `${URL}metadata.json`;
        // console.log(modelURL)
        // console.log(metadataURL)
        const model = speechCommands.create('BROWSER_FFT', undefined, modelURL, metadataURL);
        await model.ensureModelLoaded();
        const words = model.wordLabels();
        setLabels(words);

        const modelParameters : speechCommands.StreamingRecognitionConfig= {
            invokeCallbackOnNoiseAndUnknown: false, // run even when only background noise is detected
            includeSpectrogram: true, // give us access to numerical audio data
            overlapFactor: 0.5 // how often per second to sample audio, 0.5 means twice per second, 
        };
        
     
        model.listen(
            //This callback function is invoked each time the model has a prediction.
            async (prediction) => {
                setPrediction(prediction.scores)

                // console.log(prediction.scores)
                if(words.length > 0) {
                    const actualPredictionLabel = words
                        .map((label, i) => {
                            // console.log(prediction)
                            const value = Math.floor(prediction.scores[i] as number * 100);
                            return {label, value};
                        })
                        .filter((p) => !p.label.includes('Background Noise') &&  !p.label.includes('_unknown_'))
                        .filter((p) => p.value > 80);
                                            
                    const label = actualPredictionLabel.length ? actualPredictionLabel[0].label : undefined;

                    setPredictionLabel(label)
                    console.log(label)
                    if(label)
                        setPredictionHistory(prev => [...prev, label]);
                }
                // predictionCallback(prediction.scores);
            },
            modelParameters
        );
     }

     useEffect(() => {
            setupModel();
        }, []);
    
    
    const displayNumbers  = labels
        .filter((l) => !l.includes('Background Noise'))
        .sort((l1: string , l2: string) => {
            const val1 = prediction2Number[l1] || 0;
            const val2 = prediction2Number[l2] || 0;
            return (val1 - val2);
        })
 

     return <div  className='pt-5' >
        <h2 className='text-2xl font-extrabold' > Friulan Morra </h2>
        <div>

            <h3 className='text-xl font-extrabold'>Di un numero della morra friulana </h3>
            <div> I numeri sono: {displayNumbers.join(', ')}</div>
            <div> Stai Dicendo: {predictionLabel
                ? <span  >{predictionLabel}</span>
                : <span className='text-gray-500' >nothing</span>
            } 
            </div>
            {/* <LabelListPrediction labels={labels} prediction={prediction} /> */}
            {/* {JSON.stringify(actualPrediction, null, 2)} */}
            {!labels.length && <div> Loading model... </div>}
            <h3 className='text-xl font-extrabold' >Hai Detto:</h3>
            <div>{predictionHistory.map((el, idx) => {
                return <div key={idx} >{el}</div>  
            })}</div>
            
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