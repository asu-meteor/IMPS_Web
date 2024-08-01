import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField } from '@mui/material';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../Firebase';
import { useAuth } from '../../context/AuthContext';

import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '../../Images/arrowBack.png';
import ArrowForwardIcon from '../../Images/arrowForward.png';
import PropTypes from 'prop-types';

/**
 * ModifySequence component allows users to edit or delete an existing media sequence.
 * It fetches sequence data from Firestore and displays it for modification.
 * 
 * @param {object} props - The component props.
 * @param {string} props.sequenceID - The ID of the sequence to be modified.
 * @param {function} props.fetchSequences - Function to fetch sequences after modification.
 * @param {function} props.setEditSequence - Function to toggle the edit mode.
 */

const ModifySequence = ({ sequenceID, fetchSequences, setEditSequence }) => {
    const { currentUser } = useAuth();
    const [models, setModels] = useState([]);
    const [videos, setVideos] = useState([]);
    const [sequence, setSequence] = useState([]);
    const [sequenceName, setSequenceName] = useState('');
    const [sequenceCreateTimestamp, setSequenceCreateTimestamp] = useState(null);
    const [sequenceDescription, setSequenceDescription] = useState('');
    const navigate = useNavigate();

    /**
     * useEffect hook to fetch models, videos, and sequence data from Firestore.
     * It fetches data when the component mounts or when currentUser or sequenceID changes.
     */
    useEffect(() => {
        const fetchModelsAndVideos = async () => {
            if (currentUser) {
                const userUID = currentUser.uid;

                const modelsQuery = query(collection(db, `users/${userUID}/Models`), orderBy('createdAt'));
                const modelsSnapshot = await getDocs(modelsQuery);
                const modelsList = modelsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const videosQuery = query(collection(db, `users/${userUID}/Videos`), orderBy('createdAt'));
                const videosSnapshot = await getDocs(videosQuery);
                const videosList = videosSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setModels(modelsList);
                setVideos(videosList);

                const sequenceDoc = await getDoc(doc(db, `users/${userUID}/Sequences`, sequenceID));

                if (sequenceDoc.exists()) {
                    const sequenceData = sequenceDoc.data();
                    setSequenceName(sequenceData.name);
                    setSequenceDescription(sequenceData.description);
                    setSequenceCreateTimestamp(sequenceData.createdAt);
                    const populatedSequence = sequenceData.sequence.map(item => {
                        const list = item.type === 'model' ? modelsList : videosList;
                        return { ...list.find(el => el.id === item.id), type: item.type };
                    });
                    setSequence(populatedSequence);
                }
            }
        };

        fetchModelsAndVideos();
    }, [currentUser, sequenceID]);

    /**
     * Adds an item (model or video) to the sequence.
     * 
     * @param {object} item - The item to be added to the sequence.
     */
    const handleAddToSequence = (item) => {
        setSequence([...sequence, item]);
    };

    /**
     * Removes an item from the sequence based on its index.
     * 
     * @param {number} index - The index of the item to be removed.
     */
    const handleRemoveFromSequence = (index) => {
        const newSequence = Array.from(sequence);
        newSequence.splice(index, 1);
        setSequence(newSequence);
    };

    /**
     * Moves an item left in the sequence based on its index.
     * 
     * @param {number} index - The index of the item to be moved left.
     */
    const handleMoveLeft = (index) => {
        if (index === 0) return;
        const newSequence = Array.from(sequence);
        const [item] = newSequence.splice(index, 1);
        newSequence.splice(index - 1, 0, item);
        setSequence(newSequence);
    };

    /**
     * Moves an item right in the sequence based on its index.
     * 
     * @param {number} index - The index of the item to be moved right.
     */
    const handleMoveRight = (index) => {
        if (index === sequence.length - 1) return;
        const newSequence = Array.from(sequence);
        const [item] = newSequence.splice(index, 1);
        newSequence.splice(index + 1, 0, item);
        setSequence(newSequence);
    };

    /**
     * Saves the modified sequence to Firestore.
     */
    const handleSave = async () => {
        if (sequenceName.trim() === '') {
            alert('Please enter a sequence name.');
            return;
        }

        try {
            const userUID = currentUser.uid;
            const sequenceRef = doc(db, `users/${userUID}/Sequences`, sequenceID);

            const sequenceData = sequence.map(item => ({ type: item.type, id: item.id }));

            await setDoc(sequenceRef, {
                name: sequenceName,
                description: sequenceDescription,
                sequence: sequenceData,
                createdAt: sequenceCreateTimestamp,
                updatedAt: serverTimestamp(),
            });

            alert('Sequence saved successfully!');
            navigate('/IMPS/Media-Sequencer');
            fetchSequences();
            setEditSequence(false);
        } catch (error) {
            console.error('Error saving sequence:', error);
            alert('Failed to save sequence. Please try again.');
        }
    };

    /**
     * Deletes the current sequence from Firestore.
     */
    const handleDelete = async () => {
        try {
            const userUID = currentUser.uid;
            const sequenceRef = doc(db, `users/${userUID}/Sequences`, sequenceID);
            await deleteDoc(sequenceRef);
            alert('Sequence deleted successfully!');
            navigate('/IMPS/Media-Sequencer');
            fetchSequences();
            setEditSequence(false);
        } catch (error) {
            console.error('Error deleting sequence:', error);
            alert('Failed to delete sequence. Please try again.');
        }
    };

    /**
     * Cancels the edit and navigates back to the Media Sequencer page.
     */
    const handleCancel = () => {
        navigate('/IMPS/Media-Sequencer');
        fetchSequences();
        setEditSequence(false);
    };

    /**
     * Opens a new window to view the specified URL.
     * 
     * @param {string} url - The URL to be viewed.
     */
    const handleView = (url) => {
        window.open(url, '_blank');
    };

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom color="black">
                    Modify Sequence
                </Typography>
                <TextField
                    label="Sequence Name"
                    fullWidth
                    value={sequenceName}
                    onChange={(e) => setSequenceName(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Sequence Description"
                    fullWidth
                    value={sequenceDescription}
                    onChange={(e) => setSequenceDescription(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ flex: 1, mr: 1 }}>
                        <Typography variant="h5" color="black">Your Models</Typography>
                        <TableContainer component={Paper} sx={{ border: '1px solid #808080' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Model Name</TableCell>
                                        <TableCell>Add</TableCell>
                                        <TableCell>View</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {models.map((model) => (
                                        <TableRow key={model.id}>
                                            <TableCell>{model.modelName}</TableCell>
                                            <TableCell>
                                                <Button variant="contained" sx={{ backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }} onClick={() => handleAddToSequence({ ...model, type: 'model' })}>
                                                    Add
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton color="primary" sx={{ color: '#000', '&:hover': { color: '#333' } }} onClick={() => handleView(model.thumbnailURL)}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Box sx={{ flex: 1, ml: 1 }}>
                        <Typography variant="h5" color="black">Your Videos</Typography>
                        <TableContainer component={Paper} sx={{ border: '1px solid #808080' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Video Name</TableCell>
                                        <TableCell>Add</TableCell>
                                        <TableCell>View</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {videos.map((video) => (
                                        <TableRow key={video.id}>
                                            <TableCell>{video.name}</TableCell>
                                            <TableCell>
                                                <Button variant="contained" sx={{ backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }} onClick={() => handleAddToSequence({ ...video, type: 'video' })}>
                                                    Add
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton color="primary" sx={{ color: '#000', '&:hover': { color: '#333' } }} onClick={() => handleView(video.videoURL)}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', overflowX: 'auto', mb: 2, p: 2, border: '1px solid #808080', borderRadius: '4px' }}>
                    {sequence.map((item, index) => (
                        <Paper key={index} sx={{ display: 'flex', alignItems: 'center', p: 1, mr: 2, minWidth: '200px', textAlign: 'center' }}>
                            <IconButton size="small" onClick={() => handleMoveLeft(index)} disabled={index === 0}>
                                <img src={ArrowBackIcon} alt="Move Left" width="20" />
                            </IconButton>
                            <Box sx={{ mx: 1 }}>
                                <Typography variant="body2">{item.type === 'model' ? item.modelName : item.name}</Typography>
                                <Typography variant="body2">#{index + 1}</Typography>
                            </Box>
                            <IconButton size="small" onClick={() => handleRemoveFromSequence(index)}>
                                <DeleteIcon />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleMoveRight(index)} disabled={index === sequence.length - 1}>
                                <img src={ArrowForwardIcon} alt="Move Right" width="20" />
                            </IconButton>
                        </Paper>
                    ))}
                </Box>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSave}
                    sx={{ backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
                >
                    Save
                </Button>
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleCancel}
                    sx={{ mt: 2, borderColor: '#000', color: '#000', '&:hover': { borderColor: '#333', color: '#333' } }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    onClick={handleDelete}
                    sx={{ mt: 2, '&:hover': { backgroundColor: '#d32f2f' } }}
                >
                    Delete
                </Button>
            </Box>
        </Container>
    );
};

ModifySequence.propTypes = {
    sequenceID: PropTypes.string.isRequired,
    fetchSequences: PropTypes.func.isRequired,
    setEditSequence: PropTypes.func.isRequired,
};

export default ModifySequence;