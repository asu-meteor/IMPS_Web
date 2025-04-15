import { useState, useEffect } from 'react';
import { Typography, Box, Button, TextField, LinearProgress, Grid } from '@mui/material';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { db, storage } from '../../Firebase';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';

/**
 * EditVideo component allows users to edit and update video details.
 * It also handles video file upload, replacement, and deletion.
 * 
 * @param {Object} props - The props for the component.
 * @param {Object} props.content - The content object containing video details.
 * @param {Function} props.setEditContent - Function to set the editing state.
 * @param {Function} props.fetchContent - Function to fetch content list.
 */
const EditVideo = ({ content, setEditContent, fetchContent }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        name: content.name,
        description: content.description,
        videoFile: null,
    });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Adds an event listener to warn users before leaving the page during upload
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

    // Handles input changes for text fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handles file selection for video upload
    const handleFileChange = (e) => {
        setFormData({ ...formData, videoFile: e.target.files[0] });
    };

    // Handles saving the updated video details and uploading the new video file if selected
    const handleSave = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let downloadURL = content.videoURL;
            if (formData.videoFile) {
                // Delete the old video file
                const oldVideoRef = ref(storage, `${currentUser.uid}/Videos/${content.uid}`);
                await deleteObject(oldVideoRef);

                // Upload the new video file
                const newVideoFileName = `${content.uid}`;
                const videoRef = ref(storage, `${currentUser.uid}/Videos/${newVideoFileName}`);
                const uploadTask = uploadBytesResumable(videoRef, formData.videoFile);

                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(progress);
                        console.log('Upload is ' + progress + '% done');
                    },
                    (error) => {
                        setError('Failed to upload video. Please try again.');
                        console.error('Upload error:', error);
                        setIsUploading(false);
                    },
                    async () => {
                        downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        console.log('File available at', downloadURL);
                        const videoElement = document.createElement('video');
                        videoElement.src = downloadURL;
                        videoElement.addEventListener('loadedmetadata', async () => {
                            const duration = videoElement.duration;
                            console.log('Video duration:', duration);
                            await updateDoc(doc(db, `users/${currentUser.uid}/Videos`, content.uid), {
                                name: formData.name,
                                description: formData.description,
                                duration,
                                videoURL: downloadURL,
                                videoFileName: formData.videoFile.name,
                                updatedAt: serverTimestamp(),
                            });
                            alert('Video updated successfully!');
                            setError('');
                            setUploadProgress(0);
                            setIsUploading(false);
                            fetchContent();
                            setEditContent(null);
                        });
                    }
                );
            } else {
                await updateDoc(doc(db, `users/${currentUser.uid}/Videos`, content.uid), {
                    name: formData.name,
                    description: formData.description,
                    updatedAt: serverTimestamp(),
                });
                alert('Video updated successfully!');
                setError('');
                setIsUploading(false);
                fetchContent();
                setEditContent(null);

            }
        } catch (error) {
            setError('Failed to update video. Please try again.');
            console.error('Update error:', error);
            setIsUploading(false);
        }
    };

    // Handles deleting the video and its associated data
    const handleDelete = async () => {
        try {
            // Delete the video file from storage
            const videoRef = ref(storage, `${currentUser.uid}/Videos/${content.uid}`);
            await deleteObject(videoRef);

            // Delete the Firestore document
            await deleteDoc(doc(db, `users/${currentUser.uid}/Videos`, content.uid));
            alert('Video deleted successfully!');
            fetchContent();
            setEditContent(null);
        } catch (error) {
            setError('Failed to delete video. Please try again.');
            console.error('Delete error:', error);
        }
    };

    return (
        <Box>
            <Typography variant="h6" component="h2" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
                Edit Video
            </Typography>
            
            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
            
            <Box component="form" onSubmit={handleSave}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            label="Name*"
                            name="name"
                            fullWidth
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            InputProps={{
                                sx: { height: '56px' }
                            }}
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField
                            label="Description*"
                            name="description"
                            fullWidth
                            multiline
                            rows={4}
                            required
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    
                    <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>
                        <Button
                            variant="contained"
                            component="label"
                            sx={{ 
                                backgroundColor: '#8C1D40', 
                                color: '#fff', 
                                '&:hover': { 
                                    backgroundColor: '#6a1430' 
                                },
                                padding: '10px 20px',
                                fontWeight: 'normal',
                                textTransform: 'uppercase'
                            }}
                            disabled={isUploading}
                        >
                            SELECT NEW VIDEO
                            <input
                                type="file"
                                accept="video/*"
                                hidden
                                onChange={handleFileChange}
                            />
                        </Button>
                        
                        {formData.videoFile && (
                            <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
                                Selected file: {formData.videoFile.name}
                            </Typography>
                        )}
                    </Grid>
                    
                    {uploadProgress > 0 && (
                        <Grid item xs={12}>
                            <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 2 }} />
                        </Grid>
                    )}
                    
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ 
                                backgroundColor: '#FFC627', 
                                color: '#000', 
                                '&:hover': { 
                                    backgroundColor: '#e6b000' 
                                },
                                height: '40px',
                                fontWeight: 'normal',
                                textTransform: 'uppercase'
                            }}
                            disabled={isUploading}
                        >
                            SAVE CHANGES
                        </Button>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ 
                                backgroundColor: '#8C1D40', 
                                color: '#fff',
                                '&:hover': { 
                                    backgroundColor: '#6a1430' 
                                },
                                height: '40px',
                                fontWeight: 'normal',
                                textTransform: 'uppercase'
                            }}
                            onClick={handleDelete}
                            disabled={isUploading}
                        >
                            DELETE VIDEO
                        </Button>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{ 
                                color: '#000',
                                borderColor: '#ccc',
                                '&:hover': { 
                                    backgroundColor: '#f5f5f5',
                                    borderColor: '#000'
                                },
                                height: '40px',
                                fontWeight: 'normal',
                                textTransform: 'uppercase'
                            }}
                            onClick={() => { fetchContent(); setEditContent(null); }}
                        >
                            CANCEL
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

EditVideo.propTypes = {
    content: PropTypes.object.isRequired,
    setEditContent: PropTypes.func.isRequired,
    fetchContent: PropTypes.func.isRequired,
};

export default EditVideo;