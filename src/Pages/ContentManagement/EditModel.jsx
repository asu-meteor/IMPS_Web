import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Button, TextField, Checkbox, FormControlLabel, LinearProgress } from '@mui/material';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../Firebase';
import { useAuth } from '../../context/AuthContext';

/**
 * EditModel component allows the user to edit an existing model's details and files.
 * Users can modify the model's information, upload a new file, and delete the model if necessary.
 */
const EditModel = ({ content, setEditContent, fetchContent }) => {
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        modelName: content.modelName,
        modelDescription: content.modelDescription,
        roomScale: content.roomScale,
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
     * Handles saving the updated model details to Firestore.
     * 
     * @param {object} e - The event object.
     */
    const handleSave = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            const userUID = currentUser.uid;
            const modelUID = content.uid;
            const updates = {
                modelName: formData.modelName,
                modelDescription: formData.modelDescription,
                roomScale: formData.roomScale,
                updatedAt: serverTimestamp(),
            };

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

            if (formData.fbxFile) {
                const fbxURL = await uploadFile(formData.fbxFile, `${userUID}/Models/${modelUID}/model_${formData.fbxFile.name}`);
                updates.fbxURL = fbxURL;
            }

            await updateDoc(doc(db, `users/${userUID}/Models`, modelUID), updates);

            alert('Model updated successfully!');
            setError('');
            setUploadProgress(0);
            setIsUploading(false);
            setEditContent(null);
            fetchContent();
        } catch (error) {
            setError('Failed to update model. Please try again.');
            console.error('Update error:', error);
            setIsUploading(false);
        }
    };

    /**
     * Handles deleting the model from Firestore and Storage.
     */
    const handleDelete = async () => {
        try {
            const userUID = currentUser.uid;
            const modelUID = content.uid;

            const deleteFile = async (filePath) => {
                try {
                    const fileRef = ref(storage, filePath);
                    await deleteObject(fileRef);
                } catch (error) {
                    console.log("Error deleting file or file doesn't exist:", error);
                }
            };

            if (content.fbxURL) {
                await deleteFile(`${userUID}/Models/${modelUID}/model_${content.fbxFileName || 'model'}`);
            }

            await deleteDoc(doc(db, `users/${userUID}/Models`, modelUID));

            alert('Model deleted successfully!');
            setEditContent(null);
            fetchContent();
        } catch (error) {
            setError('Failed to delete model. Please try again.');
            console.error('Delete error:', error);
        }
    };

    return (
        <Box>
            <Typography variant="h6" component="h2" align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
                Edit Model
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            <Box component="form" onSubmit={handleSave} sx={{ mt: 1 }}>
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
                    CHANGE .GLTF MODEL
                    <input
                        type="file"
                        accept=".fbx, .obj, .gltf, .glb"
                        hidden
                        name="fbxFile"
                        onChange={handleFileChange}
                    />
                </Button>
                {formData.fbxFile && (
                    <Typography variant="body1" component="p" sx={{ mb: 3 }}>
                        Selected .gLTF file: {formData.fbxFile.name}
                    </Typography>
                )}
                <TextField
                    label="Model Name"
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
                <TextField
                    label="Model Description"
                    name="modelDescription"
                    fullWidth
                    required
                    multiline
                    rows={4}
                    value={formData.modelDescription}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                />
                <FormControlLabel
                    control={<Checkbox checked={formData.roomScale} onChange={handleCheckboxChange} name="roomScale" />}
                    label="Supports 1-1 Room Scale Visualization"
                    sx={{ mb: 2 }}
                />

                {uploadProgress > 0 && (
                    <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 2, mb: 2 }} />
                )}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                        mt: 3, 
                        mb: 2, 
                        backgroundColor: '#FFC627', 
                        color: '#000', 
                        '&:hover': { backgroundColor: '#e6b000' },
                        height: '45px',
                        textTransform: 'uppercase',
                        fontWeight: '600'
                    }}
                    disabled={isUploading}
                >
                    SAVE CHANGES
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    sx={{ 
                        mt: 1,
                        height: '45px'
                    }}
                    onClick={handleDelete}
                    disabled={isUploading}
                >
                    DELETE MODEL
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    sx={{ 
                        mt: 1,
                        height: '45px'
                    }}
                    onClick={() => setEditContent(null)}
                >
                    CANCEL
                </Button>
            </Box>
        </Box>
    );
};

EditModel.propTypes = {
    content: PropTypes.object.isRequired,
    setEditContent: PropTypes.func.isRequired,
    fetchContent: PropTypes.func.isRequired,
};

export default EditModel;
