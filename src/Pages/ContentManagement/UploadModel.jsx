import { useState, useEffect } from 'react';
import { Typography, Box, Button, TextField, Checkbox, FormControlLabel, LinearProgress, Grid } from '@mui/material';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../Firebase';
import { useAuth } from '../../context/AuthContext';

/**
 * UploadModel component handles the upload of new 3D models.
 * Users can fill in model details, select files, and upload them to Firestore.
 */
const UploadModel = () => {

    /**
     * Generates a short UID for identifying the model.
     * 
     * @returns {string} A 9-character alphanumeric string.
     */
    const generateShortUID = () => {
        return Math.random().toString(36).substr(2, 9);
    };

    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        modelName: '',
        modelDescription: '',
        roomScale: false,
        fbxFile: null,
    });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    /**
     * useEffect hook to handle the beforeunload event during the upload process.
     */
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isUploading) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isUploading]);

    /**
     * Handles changes in text input fields.
     * 
     * @param {object} e - The event object.
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    /**
     * Handles changes in checkbox input fields.
     * 
     * @param {object} e - The event object.
     */
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData({ ...formData, [name]: checked });
    };

    /**
     * Handles changes in file input fields.
     * 
     * @param {object} e - The event object.
     */
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData({ ...formData, [name]: files[0] });
    };

    /**
     * Handles the form submission and uploads the model to Firestore.
     * 
     * @param {object} e - The event object.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Auth is ' + currentUser.uid);

        if (!formData.fbxFile) {
            setError('Please select a .gLTF model file.');
            return;
        }

        setIsUploading(true);
        try {
            const modelUID = generateShortUID();
            const userUID = currentUser.uid;

            /**
             * Uploads a file to Firebase Storage and returns the download URL.
             * 
             * @param {File} file - The file to be uploaded.
             * @param {string} filePath - The path where the file should be stored.
             * @returns {Promise<string>} The download URL of the uploaded file.
             */
            const uploadFile = async (file, filePath) => {
                const fileRef = ref(storage, filePath);
                const uploadTask = uploadBytesResumable(fileRef, file);
                return new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                            console.log('Upload is ' + progress + '% done');
                        },
                        (error) => {
                            reject(error);
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        }
                    );
                });
            };

            /**
             * Get download URL for model
             */
            const fbxURL = await uploadFile(formData.fbxFile, `${userUID}/Models/${modelUID}/model_${formData.fbxFile.name}`);

            await setDoc(doc(db, `users/${userUID}/Models`, modelUID), {
                modelName: formData.modelName,
                modelDescription: formData.modelDescription,
                roomScale: formData.roomScale,
                fbxURL,
                uid: modelUID,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            /**
             * Clear everything
             */
            alert('Model uploaded successfully!');
            setError('');
            setFormData({
                modelName: '',
                modelDescription: '',
                roomScale: false,
                fbxFile: null,
            });
            setUploadProgress(0);
            setIsUploading(false);
        } catch (error) {
            setError('Failed to upload model. Please try again.');
            console.error('Upload error:', error);
            setIsUploading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {error && <Typography color="error">{error}</Typography>}
            
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        component="label"
                        sx={{ 
                            mb: 3, 
                            backgroundColor: '#8C1D40', 
                            color: '#fff', 
                            '&:hover': { backgroundColor: '#6a1430' },
                            height: '45px',
                            width: '100%'
                        }}
                        disabled={isUploading}
                    >
                        Select .GLTF Model
                        <input
                            type="file"
                            accept=".fbx, .obj, .gltf, .glb"
                            hidden
                            name="fbxFile"
                            onChange={handleFileChange}
                        />
                    </Button>
                    {formData.fbxFile && (
                        <Typography variant="body2" sx={{ mb: 2, fontSize: '0.8rem' }}>
                            Selected .gLTF file: {formData.fbxFile.name}
                        </Typography>
                    )}
                </Grid>
                
                <Grid item xs={12}>
                    <TextField
                        label="Name*"
                        name="modelName"
                        fullWidth
                        required
                        value={formData.modelName}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                        InputProps={{
                            sx: { height: '56px' }
                        }}
                    />
                </Grid>
                
                <Grid item xs={12}>
                    <TextField
                        label="Description*"
                        name="modelDescription"
                        fullWidth
                        required
                        multiline
                        rows={4}
                        value={formData.modelDescription}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                </Grid>
                
                <Grid item xs={12}>
                    <FormControlLabel
                        control={<Checkbox checked={formData.roomScale} onChange={handleCheckboxChange} name="roomScale" />}
                        label="Supports 1-1 Room Scale Visualization"
                        sx={{ mb: 2 }}
                    />
                </Grid>

                <Grid item xs={12}>
                    {uploadProgress > 0 && (
                        <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 2 }} />
                    )}
                </Grid>
                
                <Grid item xs={12}>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ 
                            backgroundColor: '#FFC627', 
                            color: '#000', 
                            '&:hover': { backgroundColor: '#e6b000' },
                            height: '45px',
                            textTransform: 'uppercase',
                            fontWeight: '600',
                            mb: 2
                        }}
                        disabled={isUploading}
                    >
                        UPLOAD
                    </Button>
                    
                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{ 
                            borderColor: '#ccc', 
                            color: '#000', 
                            '&:hover': { borderColor: '#000', backgroundColor: '#f5f5f5' },
                            height: '45px',
                            textTransform: 'uppercase'
                        }}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UploadModel;
