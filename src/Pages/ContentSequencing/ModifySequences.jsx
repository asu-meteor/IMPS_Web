import { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { getDocs, collection, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../Firebase';
import { useAuth } from '../../context/AuthContext';
import ModifySequence from './ModifySequence';


const ModifySequences = () => {
    const { currentUser } = useAuth();
    const [sequences, setSequences] = useState([]);
    const navigate = useNavigate();
    const [editSequence, setEditSequence] = useState(false);
    const [sequenceID, setSequenceID] = useState('');


    const fetchSequences = useCallback(async () => {
        if (currentUser) {
            const userUID = currentUser.uid;
            const sequencesQuery = query(collection(db, `users/${userUID}/Sequences`), orderBy('createdAt'));
            const sequencesSnapshot = await getDocs(sequencesQuery);
            const sequencesList = sequencesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSequences(sequencesList);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchSequences();
    }, [fetchSequences]);

    const handleEdit = (sequenceId) => {
        setEditSequence(true);
        setSequenceID(sequenceId);
        navigate(`/IMPS/Media-Sequencer/${sequenceId}`);
    };

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Modify Existing Sequences
                </Typography>
                {!editSequence ? (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Created At</TableCell>
                                    <TableCell>Modified At</TableCell>
                                    <TableCell>Edit</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sequences.map((sequence) => (
                                    <TableRow key={sequence.id}>
                                        <TableCell>{sequence.name}</TableCell>
                                        <TableCell>{sequence.description}</TableCell>
                                        <TableCell>{sequence.createdAt.toDate().toLocaleString()}</TableCell>
                                        <TableCell>{sequence.updatedAt.toDate().toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button variant="contained" sx={{ backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }} onClick={() => handleEdit(sequence.id)}>
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                        <ModifySequence sequenceID={sequenceID} fetchSequences={fetchSequences} setEditSequence={setEditSequence} />
                )}
            </Box>
        </Container>
    );
};

export default ModifySequences;
