import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, TextField, Checkbox, FormControlLabel, LinearProgress, Grid, IconButton } from '@mui/material';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../Firebase';
import { useAuth } from '../../context/AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';

const UploadModel = () => {
    const generateShortUID = () => {
        return Math.random().toString(36).substr(2, 9); // Generates a 9-character alphanumeric string
    };

    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        modelName: '',
        modelDescription: '',
        roomScale: false,
        animations: [],
        contents: [],
        mediaFile: null,
        fbxFile: null,
        thumbnailFile: null,
    });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isUploading, setIsUploading] = useState(false);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData({ ...formData, [name]: checked });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData({ ...formData, [name]: files[0] });
    };

    const addAnimation = () => {
        setFormData({
            ...formData,
            animations: [
                ...formData.animations,
                { uiName: '', animationName: '', order: formData.animations.length + 1 },
            ],
        });
    };

    const addContent = () => {
        setFormData({
            ...formData,
            contents: [
                ...formData.contents,
                { title: '', description: '', order: formData.contents.length + 1 },
            ],
        });
    };

    const handleAnimationChange = (index, field, value) => {
        const newAnimations = [...formData.animations];
        newAnimations[index][field] = value;
        setFormData({ ...formData, animations: newAnimations });
    };

    const handleContentChange = (index, field, value) => {
        const newContents = [...formData.contents];
        newContents[index][field] = value;
        setFormData({ ...formData, contents: newContents });
    };

    const removeAnimation = (index) => {
        const newAnimations = formData.animations.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            animations: newAnimations.map((animation, i) => ({
                ...animation,
                order: i + 1,
            })),
        });
    };

    const removeContent = (index) => {
        const newContents = formData.contents.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            contents: newContents.map((content, i) => ({
                ...content,
                order: i + 1,
            })),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Auth is ' + currentUser.uid);

        if (!formData.fbxFile || !formData.thumbnailFile) {
            setError('Please select both a media file and an FBX model file.');
            return;
        }

        setIsUploading(true);
        try {
            const modelUID = generateShortUID();
            const userUID = currentUser.uid;

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

            const fbxURL = await uploadFile(formData.fbxFile, `${userUID}/Models/${modelUID}/fbx_${formData.fbxFile.name}`);
            const thumbnailURL = await uploadFile(formData.thumbnailFile, `${userUID}/Models/${modelUID}/thumbnail_${formData.thumbnailFile.name}`);
            const mediaURL = formData.mediaFile !== null ? await uploadFile(formData.mediaFile, `${userUID}/Models/${modelUID}/media_${formData.mediaFile.name}`) : null ;

            await setDoc(doc(db, `users/${userUID}/Models`, modelUID), {
                modelName: formData.modelName,
                modelDescription: formData.modelDescription,
                roomScale: formData.roomScale,
                animations: formData.animations,
                contents: formData.contents,
                mediaURL,
                thumbnailURL,
                fbxURL,
                uid: modelUID,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            setSuccess('Model uploaded successfully!');
            setError('');
            setFormData({
                modelName: '',
                modelDescription: '',
                roomScale: false,
                animations: [],
                contents: [],
                mediaFile: null,
                thumbnailURL: null,
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
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h5" component="h2" color='black' gutterBottom>
                    Upload New Model
                </Typography>
                {error && <Typography color="error">{error}</Typography>}
                {success && <Typography color="success">{success}</Typography>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>

                            <Button
                                variant="contained"
                                component="label"
                                sx={{ mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
                                disabled={isUploading}
                            >
                                Select FBX Model
                                <input
                                    type="file"
                                    accept=".fbx"
                                    hidden
                                    name="fbxFile"
                                    onChange={handleFileChange}
                                />
                             </Button>
                            {formData.fbxFile && (
                                <Typography variant="body1" component="p" color="black" sx={{ mb :3}}>
                                    Selected FBX file: {formData.fbxFile.name}
                                </Typography>
                                    )}
                         </Grid>
                        <Grid item xs={12} md={6}>

                            <Button
                                variant="contained"
                                component="label"
                                sx={{ mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
                                disabled={isUploading}
                            >
                                Select Model Thumbnail
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    name="thumbnailFile"
                                    onChange={handleFileChange}
                                />
                            </Button>
                            {formData.thumbnailFile && (
                                <Typography variant="body1" component="p" color="black" sx={{ mb: 3 }}>
                                    Selected Thumbnail File: {formData.thumbnailFile.name}
                                </Typography>)}
                         </Grid>
                    </Grid>
                    <TextField
                        label="Model Name"
                        name="modelName"
                        fullWidth
                        required
                        value={formData.modelName}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Model Description"
                        name="modelDescription"
                        fullWidth
                        required
                        value={formData.modelDescription}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={formData.roomScale} onChange={handleCheckboxChange} name="roomScale" />}
                        label="Supports 1-1 Room Scale Visualization"
                        sx={{ mb: 2, color: 'black' }}
                    />

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" color='black'>Animations</Typography>
                            <Button
                                variant="contained"
                                onClick={addAnimation}
                                sx={{ mt: 2, mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
                                disabled={isUploading || formData.animations.length >= 5}
                            >
                                Add Model Animation (optional)
                            </Button>
                            {formData.animations.map((animation, index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                    <TextField
                                        label="UI Name"
                                        fullWidth
                                        value={animation.uiName}
                                        onChange={(e) => handleAnimationChange(index, 'uiName', e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                    <TextField
                                        label="Animation Name"
                                        fullWidth
                                        value={animation.animationName}
                                        onChange={(e) => handleAnimationChange(index, 'animationName', e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                    <TextField
                                        label="Order of Appearance"
                                        fullWidth
                                        type="number"
                                        value={animation.order}
                                        disabled
                                        sx={{ mb: 1 }}
                                    />
                                    <IconButton
                                        aria-label="delete"
                                        onClick={() => removeAnimation(index)}
                                        disabled={isUploading}
                                        sx={{ color: 'red' }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" color='black'>Contents</Typography>
                            <Button
                                variant="contained"
                                onClick={addContent}
                                sx={{ mt: 2, mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
                                disabled={isUploading || formData.contents.length >= 5}
                            >
                                Add Support Content (optional)
                            </Button>
                            {formData.contents.map((content, index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                    <TextField
                                        label="Title"
                                        fullWidth
                                        value={content.title}
                                        onChange={(e) => handleContentChange(index, 'title', e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                    <TextField
                                        label="Description"
                                        fullWidth
                                        value={content.description}
                                        onChange={(e) => handleContentChange(index, 'description', e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                    <TextField
                                        label="Order of Appearance"
                                        fullWidth
                                        type="number"
                                        value={content.order}
                                        disabled
                                        sx={{ mb: 1 }}
                                    />
                                    <IconButton
                                        aria-label="delete"
                                        onClick={() => removeContent(index)}
                                        disabled={isUploading}
                                        sx={{ color: 'red' }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" color='black'>Media</Typography>
                            <Button
                                variant="contained"
                                component="label"
                                sx={{ mt: 2, mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
                                disabled={isUploading}
                            >
                                Select Support Media (optional)
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    hidden
                                    name="mediaFile"
                                    onChange={handleFileChange}
                                />
                            </Button>
                            {formData.mediaFile && (
                                <Typography variant="body1" component="p" color="black">
                                    Selected media file: {formData.mediaFile.name}
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                    {uploadProgress > 0 && (
                        <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 2, mb: 2 }} />
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
                        disabled={isUploading}
                    >
                        Upload
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default UploadModel;
