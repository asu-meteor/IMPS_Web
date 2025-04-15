import { useState, useEffect } from 'react';
import { Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField } from '@mui/material';
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
        <Box>
            <Typography variant="h6" component="h2" align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
                Modify Sequence
            </Typography>
            
            <TextField
                label="Name*"
                fullWidth
                value={sequenceName}
                onChange={(e) => setSequenceName(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                    sx: { height: '56px' }
                }}
            />
            
            <TextField
                label="Description*"
                fullWidth
                multiline
                rows={4}
                value={sequenceDescription}
                onChange={(e) => setSequenceDescription(e.target.value)}
                sx={{ mb: 3 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" align="center" sx={{ mb: 1, fontWeight: 'medium', bgcolor: '#f5f5f5', p: 1 }}>
                        Your Models
                    </Typography>
                    <TableContainer component={Paper} sx={{ border: '1px solid #eee', boxShadow: 'none' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="center">Add</TableCell>
                                    <TableCell align="center">View</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {models.map((model) => (
                                    <TableRow key={model.id}>
                                        <TableCell>{model.modelName}</TableCell>
                                        <TableCell align="center">
                                            <Button 
                                                variant="contained" 
                                                sx={{ 
                                                    backgroundColor: '#8C1D40', 
                                                    color: '#fff', 
                                                    '&:hover': { backgroundColor: '#6a1430' },
                                                    textTransform: 'none',
                                                    fontWeight: 'normal',
                                                    padding: '5px 15px',
                                                    minWidth: '40px'
                                                }} 
                                                onClick={() => handleAddToSequence({ ...model, type: 'model' })}
                                            >
                                                Add
                                            </Button>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton 
                                                sx={{ 
                                                    '&:hover': { color: '#8C1D40' } 
                                                }} 
                                                onClick={() => handleView(model.fbxURL)}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" align="center" sx={{ mb: 1, fontWeight: 'medium', bgcolor: '#f5f5f5', p: 1 }}>
                        Your Videos
                    </Typography>
                    <TableContainer component={Paper} sx={{ border: '1px solid #eee', boxShadow: 'none' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="center">Add</TableCell>
                                    <TableCell align="center">View</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {videos.map((video) => (
                                    <TableRow key={video.id}>
                                        <TableCell>{video.name}</TableCell>
                                        <TableCell align="center">
                                            <Button 
                                                variant="contained" 
                                                sx={{ 
                                                    backgroundColor: '#8C1D40', 
                                                    color: '#fff', 
                                                    '&:hover': { backgroundColor: '#6a1430' },
                                                    textTransform: 'none',
                                                    fontWeight: 'normal',
                                                    padding: '5px 15px',
                                                    minWidth: '40px'
                                                }} 
                                                onClick={() => handleAddToSequence({ ...video, type: 'video' })}
                                            >
                                                Add
                                            </Button>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton 
                                                sx={{ 
                                                    '&:hover': { color: '#8C1D40' } 
                                                }} 
                                                onClick={() => handleView(video.videoURL)}
                                            >
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
            
            <Box sx={{ mb: 4, p: 2, border: '1px solid #eee', borderRadius: '4px', minHeight: '100px' }}>
                {sequence.map((item, index) => (
                    <Paper key={index} sx={{ display: 'inline-flex', alignItems: 'center', p: 1, mr: 2, mb: 2, minWidth: '120px', textAlign: 'center', border: '1px solid #eee', boxShadow: 'none' }}>
                        <IconButton size="small" onClick={() => handleMoveLeft(index)} disabled={index === 0}>
                            <img src={ArrowBackIcon} alt="Move Left" width="16" />
                        </IconButton>
                        <Box sx={{ mx: 1 }}>
                            <Typography variant="body2">{item.type === 'model' ? item.modelName : item.name}</Typography>
                            <Typography variant="caption">#{index + 1}</Typography>
                        </Box>
                        <IconButton size="small" onClick={() => handleRemoveFromSequence(index)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleMoveRight(index)} disabled={index === sequence.length - 1}>
                            <img src={ArrowForwardIcon} alt="Move Right" width="16" />
                        </IconButton>
                    </Paper>
                ))}
            </Box>
            
            <Button
                variant="contained"
                fullWidth
                onClick={handleSave}
                sx={{ 
                    backgroundColor: '#FFC627', 
                    color: '#000', 
                    '&:hover': { backgroundColor: '#e6b000' },
                    height: '45px',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    mb: 2
                }}
            >
                SAVE CHANGES
            </Button>
            
            <Button
                variant="outlined"
                fullWidth
                onClick={handleCancel}
                sx={{ 
                    borderColor: '#ccc', 
                    color: '#000', 
                    '&:hover': { borderColor: '#000', backgroundColor: '#f5f5f5' },
                    height: '45px',
                    textTransform: 'uppercase',
                    fontWeight: 'normal',
                    mb: 2
                }}
            >
                CANCEL
            </Button>
            
            <Button
                variant="contained"
                fullWidth
                onClick={handleDelete}
                sx={{ 
                    backgroundColor: '#8C1D40',
                    color: '#fff',
                    height: '45px',
                    textTransform: 'uppercase',
                    fontWeight: 'normal',
                    '&:hover': { backgroundColor: '#6a1430' }
                }}
            >
                DELETE
            </Button>
        </Box>
    );
};

ModifySequence.propTypes = {
    sequenceID: PropTypes.string.isRequired,
    fetchSequences: PropTypes.func.isRequired,
    setEditSequence: PropTypes.func.isRequired,
};

export default ModifySequence;