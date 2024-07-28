import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, TextField, LinearProgress } from '@mui/material';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { db, storage } from '../../Firebase';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';


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

    const handleFileChange = (e) => {
        setFormData({ ...formData, videoFile: e.target.files[0] });
    };

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
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom color="black">
                    Edit Video
                </Typography>
                {error && <Typography color="error">{error}</Typography>}
                <Box component="form" onSubmit={handleSave} sx={{ mt: 1 }}>
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
                        Select New Video
                        <input
                            type="file"
                            accept="video/*"
                            hidden
                            onChange={handleFileChange}
                        />
                    </Button>
                    {formData.videoFile && (
                        <Typography variant="body1" component="p" color="black">
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
                        Delete Video
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 1 }}
                        onClick={() => { fetchContent(); setEditContent(null); }}
                    >
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

EditVideo.propTypes = {
    content: PropTypes.object.isRequired,
    setEditContent: PropTypes.func.isRequired,
    fetchContent: PropTypes.func.isRequired,
};

export default EditVideo;