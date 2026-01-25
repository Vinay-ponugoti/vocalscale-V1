import React from 'react';
import { Composition } from 'remotion';
import { ComparisonComposition } from './ComparisonComposition';

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
        </>
    );
};
