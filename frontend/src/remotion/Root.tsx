import React from 'react';
import { Composition } from 'remotion';
import { ComparisonComposition } from './ComparisonComposition';
import { LogComposition } from './LogComposition';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Comparison"
                component={ComparisonComposition}
                durationInFrames={180}
                fps={30}
                width={1280}
                height={720}
            />
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
