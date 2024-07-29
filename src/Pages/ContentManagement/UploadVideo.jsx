import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, TextField, LinearProgress } from '@mui/material';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../Firebase';
import { useAuth } from '../../context/AuthContext';

/**
 * UploadVideo component handles the upload of new video content.
 * Users can fill in video details, select a video file, and upload it to Firestore.
 */
const UploadVideo = () => {
    /**
     * Generates a short UID for identifying the video.
     * 
     * @returns {string} A 9-character alphanumeric string.
     */
    const generateShortUID = () => {
        return Math.random().toString(36).substr(2, 9);
    };

    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        videoFile: null,
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
     * Handles changes in file input fields.
     * 
     * @param {object} e - The event object.
     */
    const handleFileChange = (e) => {
        setFormData({ ...formData, videoFile: e.target.files[0] });
    };

    /**
     * Handles the form submission and uploads the video to Firestore.
     * 
     * @param {object} e - The event object.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Auth is ' + currentUser.uid);

        if (!formData.videoFile) {
            setError('Please select a video file.');
            return;
        }

        setIsUploading(true);
        try {
            const videoUID = generateShortUID();
            const userUID = currentUser.uid;
            const videoRef = ref(storage, `${userUID}/Videos/${videoUID}`);
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
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log('File available at', downloadURL);
                    const videoElement = document.createElement('video');
                    videoElement.src = downloadURL;
                    videoElement.addEventListener('loadedmetadata', async () => {
                        const duration = videoElement.duration;
                        console.log('Video duration:', duration);
                        await setDoc(doc(db, `users/${userUID}/Videos`, videoUID), {
                            name: formData.name,
                            description: formData.description,
                            duration,
                            videoURL: downloadURL,
                            uid: videoUID,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp(),
                        });
                        alert('Video uploaded successfully!');
                        setError('');
                        setFormData({
                            name: '',
                            description: '',
                            videoFile: null,
                        });
                        setUploadProgress(0);
                        setIsUploading(false);
                    });
                }
            );
        } catch (error) {
            setError('Failed to upload video. Please try again.');
            console.error('Upload error:', error);
            setIsUploading(false);
        }
    };

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h5" component="h2" color='black' gutterBottom>
                    Upload a New Video
                </Typography>
                {error && <Typography color="error">{error}</Typography>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        label="Name"
                        name="name"
                        fullWidth
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Description"
                        name="description"
                        fullWidth
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant="contained"
                        component="label"
                        sx={{ mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
                        disabled={isUploading}
                    >
                        Select Video
                        <input
                            type="file"
                            accept="video/*"
                            hidden
                            onChange={handleFileChange}
                        />
                    </Button>
                    {formData.videoFile && (
                        <Typography variant="body1" component="p" color='black'>
                            Selected file: {formData.videoFile.name}
                        </Typography>
                    )}
                    {uploadProgress > 0 && (
                        <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 2 }} />
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

export default UploadVideo;
