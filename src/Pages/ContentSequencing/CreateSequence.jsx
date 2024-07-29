import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField } from '@mui/material';
import { doc, setDoc, getDocs, collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../Firebase';
import { useAuth } from '../../context/AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '../../Images/arrowBack.png';
import ArrowForwardIcon from '../../Images/arrowForward.png';

/**
* CreateSequence component handles the creation of new media sequences.
* Users can add models and videos to a sequence, reorder items, and save the sequence to Firestore.
*/
const CreateSequence = () => {
    const { currentUser } = useAuth();
    const [models, setModels] = useState([]);
    const [videos, setVideos] = useState([]);
    const [sequence, setSequence] = useState([]);
    const [sequenceName, setSequenceName] = useState('');
    const [sequenceDescription, setSequenceDescription] = useState('');

    /**
    * useEffect hook to fetch models and videos from Firestore for the current user.
    * It fetches the data when the component mounts or when the currentUser changes.
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
            }
        };

        fetchModelsAndVideos();
    }, [currentUser]);

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
    * Submits the sequence to Firestore.
    * Saves the sequence name, description, and items in the sequence.
    */
    const handleSubmit = async () => {
        if (sequenceName.trim() === '') {
            alert('Please enter a sequence name.');
            return;
        }

        try {
            const userUID = currentUser.uid;
            const sequenceUID = Math.random().toString(36).substr(2, 9);
            const sequenceRef = doc(db, `users/${userUID}/Sequences`, sequenceUID);

            const sequenceData = sequence.map(item => ({ type: item.type, id: item.id }));

            await setDoc(sequenceRef, {
                name: sequenceName,
                description: sequenceDescription,
                sequence: sequenceData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            alert('Sequence saved successfully!');
            setSequenceName('');
            setSequenceDescription('');
            setSequence([]);
        } catch (error) {
            console.error('Error saving sequence:', error);
            alert('Failed to save sequence. Please try again.');
        }
    };

    /**
    * Opens a new window to view the specified URL.
    * 
    * @param {string} url - The URL to be viewed.
    */
    const handleView = (url) => {
        window.open(url, '_blank');
    };

    /**
    * Clears the sequence form.
    * Resets the sequence name, description, and items.
    */
    const handleClear = () => {
        setSequenceName('');
        setSequenceDescription('');
        setSequence([]);
    };

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom color="black">
                    Create Sequence
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
                    onClick={handleSubmit}
                    sx={{ backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
                >
                    Save Sequence
                </Button>
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleClear}
                    sx={{ mt: 2, borderColor: '#000', color: '#000', '&:hover': { borderColor: '#333', color: '#333' } }}
                >
                    Clear
                </Button>
            </Box>
        </Container>
    );
};

export default CreateSequence;
