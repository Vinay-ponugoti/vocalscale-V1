import React from 'react';
import { Composition } from 'remotion';
import { LogComposition } from './LogComposition';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Log"
                component={LogComposition}
                durationInFrames={250}
                fps={30}
                width={1280}
                height={720}
            />
        </>
    );
};
