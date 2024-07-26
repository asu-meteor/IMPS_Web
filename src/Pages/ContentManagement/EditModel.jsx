import React, { useState, useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { Container, Typography, Box, Button, TextField, Checkbox, FormControlLabel, LinearProgress, Grid, IconButton } from '@mui/material';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../Firebase';
import { useAuth } from '../../context/AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';

const ModelVisualizer = React.lazy(() => import('./ModelVisualizer'));

const Loading = () => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
        <Typography>Loading...</Typography>
    </div>
);

const EditModel = ({ content, setEditContent, fetchContent }) => {
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        modelName: content.modelName,
        modelDescription: content.modelDescription,
        roomScale: content.roomScale,
        animations: content.animations,
        contents: content.contents,
        mediaFile: null,
        fbxFile: null,
        thumbnailFile: null,
    });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [mediaDisplay, setMediaDisplay] = useState('');
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
                animations: formData.animations,
                contents: formData.contents,
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
                const fbxURL = await uploadFile(formData.fbxFile, `${userUID}/Models/${modelUID}/fbx_${formData.fbxFile.name}`);
                updates.fbxURL = fbxURL;
            }

            if (formData.thumbnailFile) {
                const thumbnailURL = await uploadFile(formData.thumbnailFile, `${userUID}/Models/${modelUID}/thumbnail_${formData.thumbnailFile.name}`);
                updates.thumbnailURL = thumbnailURL;
            }

            if (formData.mediaFile) {
                const mediaURL = await uploadFile(formData.mediaFile, `${userUID}/Models/${modelUID}/media_${formData.mediaFile.name}`);
                updates.mediaURL = mediaURL;
            }

            await updateDoc(doc(db, `users/${userUID}/Models`, modelUID), updates);

            setSuccess('Model updated successfully!');
            setError('');
            setUploadProgress(0);
            setIsUploading(false);
            setEditContent(null);
            setMediaDisplay('');
            fetchContent();
        } catch (error) {
            setError('Failed to update model. Please try again.');
            console.error('Update error:', error);
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const userUID = currentUser.uid;
            const modelUID = content.uid;

            const deleteFile = async (filePath) => {
                const fileRef = ref(storage, filePath);
                await deleteObject(fileRef);
            };

            if (content.fbxURL) {
                await deleteFile(`${userUID}/Models/${modelUID}/fbx_${content.fbxFileName}`);
            }

            if (content.thumbnailURL) {
                await deleteFile(`${userUID}/Models/${modelUID}/thumbnail_${content.thumbnailFileName}`);
            }

            if (content.mediaURL) {
                await deleteFile(`${userUID}/Models/${modelUID}/media_${content.mediaFileName}`);
            }

            await deleteDoc(doc(db, `users/${userUID}/Models`, modelUID));

            setSuccess('Model deleted successfully!');
            setEditContent(null);
            setMediaDisplay('');
            fetchContent();
        } catch (error) {
            setError('Failed to delete model. Please try again.');
            console.error('Delete error:', error);
        }
    };

    const renderMedia = (contentType) => {
        switch (contentType) {
            case "FBX":
                return (
                    // Your JSX for FBX content
                    <Container>
                        <Typography color="black">FBX Content</Typography>
                        <ModelVisualizer modelURL={content.fbxURL} />
                    </Container>

                );
            case "Thumbnail":
                return (
                    // Your JSX for Video content
                    <Container>
                        <Typography color="black">Thumbnail Image</Typography>
                        <Box
                                component="img"
                                src={content.thumbnailURL}
                                alt="Model Thumbnail"
                                sx={{ width: '100%', height: 'auto', maxWidth: 200, maxHeight: 200 }}
                        />
                    </Container>
                );
            case "SupportMedia":
                return (
                    // Your JSX for Model content
                    <Container>
                        <Typography color="black">Support Media Image</Typography>
                         <Box
                                component="img"
                                src={content.mediaURL}
                                alt="Support Media"
                                sx={{ width: '100%', height: 'auto', maxWidth: 200, maxHeight: 200 }}
                        />
                    </Container>
                );
            default:
                return null;
        }
    };

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h5" component="h2" color='black' gutterBottom>
                    Edit Model
                </Typography>
                {error && <Typography color="error">{error}</Typography>}
                {success && <Typography color="success">{success}</Typography>}
                <Box component="form" onSubmit={handleSave} sx={{ mt: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Button
                                variant="contained"
                                component="label"
                                sx={{ mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
                                disabled={isUploading}
                            >
                                Change FBX Model
                                <input
                                    type="file"
                                    accept=".fbx"
                                    hidden
                                    name="fbxFile"
                                    onChange={handleFileChange}
                                />
                            </Button>
                            {formData.fbxFile && (
                                <Typography variant="body1" component="p" color="black" sx={{ mb: 3 }}>
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
                                Change Model Thumbnail
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
                                </Typography>
                            )}
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
                            {formData.contents.map((supportContent, index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                    <TextField
                                        label="Title"
                                        fullWidth
                                        value={supportContent.title}
                                        onChange={(e) => handleContentChange(index, 'title', e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                    <TextField
                                        label="Description"
                                        fullWidth
                                        value={supportContent.description}
                                        onChange={(e) => handleContentChange(index, 'description', e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                    <TextField
                                        label="Order of Appearance"
                                        fullWidth
                                        type="number"
                                        value={supportContent.order}
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
                        Save Changes
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        sx={{ mt: 1 }}
                        onClick={handleDelete}
                        disabled={isUploading}
                    >
                        Delete Model
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 1 }}
                        onClick={() => setEditContent(null)}
                    >
                        Cancel
                    </Button>
                </Box>
                <Grid container spacing={2} sx={{ mt: 4 }}>
                    {content.fbxURL && (
                        <Grid item xs={12} md={4}>
                            <Button
                                variant="contained"
                                sx={{ mt: 2, mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
                                onClick={() => setMediaDisplay("FBX")}
                            >
                                Visualize Model
                            </Button>
                        </Grid>
                    )}
                    {content.thumbnailURL && (
                        <Grid item xs={12} md={4}>
                            <Button
                                variant="contained"
                                sx={{ mt: 2, mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
                                onClick={() => setMediaDisplay("Thumbnail")}
                            >
                                See Thumbnail
                            </Button>
                        </Grid>
                    )}
                    {content.mediaURL && (
                        <Grid item xs={12} md={4}>
                            <Button
                                variant="contained"
                                sx={{ mt: 2, mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
                                onClick={() => setMediaDisplay("SupportMedia")}
                            >
                                See Support Image
                            </Button>
                        </Grid>
                    )}
                </Grid>
                {mediaDisplay !== '' && (
                    <Box sx={{ mt: 3, width: '100%', height: '500px', position: 'relative', border: '2px solid black', borderRadius: '8px', }}>
                        <Suspense fallback={<Loading />}>
                            {renderMedia(mediaDisplay)}
                        </Suspense>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

EditModel.propTypes = {
    content: PropTypes.object.isRequired,
    setEditContent: PropTypes.func.isRequired,
    fetchContent: PropTypes.func.isRequired,
};

export default EditModel;
