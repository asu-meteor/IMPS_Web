/* eslint-disable react/no-unknown-property */
import { Canvas, useLoader } from '@react-three/fiber';
//import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

//import { useFBX, Stage, PresentationControls } from '@react-three/drei';
import { Stage, PresentationControls } from '@react-three/drei';
import PropTypes from 'prop-types';

/**
 * ModelVisualizer component renders a 3D model using the provided model URL.
 * It uses the FBXLoader to load the model and the @react-three/fiber Canvas for rendering.
 * The model can be interacted with using the PresentationControls.
 *
 * @param {string} modelURL - The URL of the 3D model to be visualized.
 */
const ModelVisualizer = ({ modelURL }) => {
    // Load the FBX model using the provided URL
    const gltf = useLoader(GLTFLoader, modelURL);
    //const fbx = useLoader(FBXLoader, modelURL);

    return (
        <Canvas dpr={[1, 2]} shadows camera={{ fov: 45 }} style={{ "position": "absolute" }}>
            <pointLight position={[10, 10, 10]} />

            <PresentationControls speed={1.5} global zoom={0.5} polar={[-0.1, Math.PI/4] }>
                <Stage environment={"sunset"}>
                    <primitive object={gltf.scene} scale={0.1} />
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