"use client";

import { AudioNoisePrediction } from "./AudioNoisePrediction";
import { LowPassFilter } from "./LowPassFilter";
import { TFSpeechCommandPrediction } from "./TFSpeechCommandPrediction";
import { LinearModelPrediction } from "./LinearModelPrediction";
import { FriulanMorra } from "./FriulanMorra";


export const AudioDemo = () => {
    
    return(
        <div>
            <h1 className='text-3xl font-extrabold' >Audio Demo</h1>
            <FriulanMorra />
            {/* <LinearModelPrediction />
            <LowPassFilter />
            <AudioNoisePrediction />
            <TFSpeechCommandPrediction /> */}
        </div>
    );
};

