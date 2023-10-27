import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Tensor,Rank } from '@tensorflow/tfjs';
const model = tf.sequential();

export const LinearModelPrediction = () => {
 
    const [prediction, setPrediction] = useState<Tensor<Rank>| undefined>(undefined)
    const [inputValue, setInputValue] = useState<string|undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string|undefined>(undefined)
    const [isModelLoaded, setisModelLoaded] = useState<boolean>(false)    

    async function setupModel() {
        // Create a simple model.
        
        model.add(tf.layers.dense({units: 1, inputShape: [1]}));

        // Prepare the model for training: Specify the loss and the optimizer.
        model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

        // Generate some synthetic data for training. (y = 2x - 1)
        const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4,5,6,7,8], [10, 1]);
        // const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);
        const ys = tf.tensor2d([5,5,5,5,5,5,5,5,5,5], [10, 1]);

        // Train the model using the data.
        await model.fit(xs, ys, {epochs: 250});
        setisModelLoaded(true)
        
    }

    useEffect(() => {
        setupModel();
    }, []);
    

     return <div  className='pt-5' >
        <h2 className='text-2xl font-extrabold' > Linear Prediction </h2>
        <div>
            <div>
                <form className="w-full max-w-sm" onSubmit={e => e.preventDefault()}  >
                    <div className="flex items-center border-b border-teal-500 py-2">
                        <input 
                            className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none" 
                            type="text" placeholder="Jane Doe" aria-label="Full name" 
                            onChange={e => setInputValue(e.currentTarget.value)}
                        />
                        <button 
                            className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded" 
                            type="button"  
                            onClick={e=> {
                                if(!isModelLoaded){
                                    setErrorMessage('model not loaded yet, wait few seconds then retry')
                                }
                                const inputValueNum = parseInt(inputValue as string);
                                if(Number.isNaN(inputValueNum)){
                                    setPrediction(undefined)
                                    setErrorMessage('input should be a number')
                                    return;
                                }else{
                                    setErrorMessage(undefined)
                                }
                                let curPrediction = model.predict(tf.tensor2d([5], [1, 1]))
                                console.log(`curPrediction: ` ,Object.keys(curPrediction))
                                if(curPrediction && !Array.isArray(curPrediction))
                                    setPrediction(curPrediction)
                            }}
                        >
                        Predict
                        </button>
                    </div>
                </form>
                {errorMessage && (<div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                    <span className="font-medium">{errorMessage}</span> 
                </div>) }
            </div>
            {prediction ? (<div className='pt-5' >
                <b>Prediction:</b> {prediction.arraySync()}
            </div>) :<></>}
        </div>
     </div>

};