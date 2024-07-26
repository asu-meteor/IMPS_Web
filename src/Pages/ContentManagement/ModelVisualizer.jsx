/* eslint-disable react/no-unknown-property */
import { Canvas, useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
//import { useFBX, Stage, PresentationControls } from '@react-three/drei';
import { Stage, PresentationControls } from '@react-three/drei';
import PropTypes from 'prop-types';

const ModelVisualizer = ({ modelURL }) => {
    console.log(modelURL);
    //const fbx = useFBX(modelURL);
    const fbx = useLoader(FBXLoader, modelURL);

    return (
        <Canvas dpr={[1, 2]} shadows camera={{ fov: 45 }} style={{ "position": "absolute" }}>
            <pointLight position={[10, 10, 10]} />

            <PresentationControls speed={1.5} global zoom={0.5} polar={[-0.1, Math.PI/4] }>
                <Stage environment={"sunset"}>
                        <primitive object={fbx} scale={0.1} />
                </Stage>
            </PresentationControls>
        </Canvas>
    );
};

ModelVisualizer.propTypes = {
    modelURL: PropTypes.string.isRequired,
};

export default ModelVisualizer;
/* eslint-enable react/no-unknown-property */