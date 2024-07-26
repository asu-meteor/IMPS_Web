import { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../Firebase';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import EditVideo from './EditVideo';
import EditModel from './EditModel';


const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const ModifyContent = () => {
    const { currentUser } = useAuth();
    const [contentType, setContentType] = useState('Video');
    const [contentList, setContentList] = useState([]);
    const [editContent, setEditContent] = useState(null);

    const fetchContent = useCallback(async () => {
        if (currentUser) {
            const contentCollection = collection(db, `users/${currentUser.uid}/${contentType}s`);
            const contentSnapshot = await getDocs(contentCollection);
            const contentData = contentSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setContentList(contentData);
        }
    }, [currentUser, contentType]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleEditClick = (content) => {
        setEditContent(content);
    };

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom color="black">
                    Modify Content
                </Typography>
                <TextField
                    select
                    label="Content Type"
                    fullWidth
                    value={contentType}
                    onChange={(e) => { setContentType(e.target.value); setEditContent(null); }}
                    sx={{ mb: 2 }}
                >
                    <MenuItem value="Video">Video</MenuItem>
                    <MenuItem value="Model">Model</MenuItem>
                </TextField>
                {!editContent ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                {contentType === "Video" ? (<TableCell>Duration</TableCell>) : (<TableCell>Room Scale</TableCell>)}
                                <TableCell>Created On</TableCell>
                                <TableCell>Last Modified</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {contentList.map((content) => (
                                <TableRow key={content.id}>
                                    {contentType === "Video" ? (<TableCell>{content.name}</TableCell>) : (<TableCell>{content.modelName}</TableCell>)}
                                    {contentType === "Video" ? (<TableCell>{content.description}</TableCell>) : (<TableCell>{content.modelDescription}</TableCell>)}
                                    {(contentType === "Video") ? (<TableCell>{formatDuration(content.duration)}</TableCell>) : (<TableCell>{(content.roomScale === true) ? "True" : "False"}</TableCell>)}
                                    <TableCell>{content.createdAt ? format(content.createdAt.toDate(), 'PPpp') : 'N/A'}</TableCell>
                                    <TableCell>{content.updatedAt ? format(content.updatedAt.toDate(), 'PPpp') : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" sx={{ backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' }}} onClick={() => handleEditClick(content)}>
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                ) : contentType === 'Video' ? (
                        <EditVideo content={editContent} setEditContent={setEditContent} fetchContent={fetchContent} />
                ) : (
                        <EditModel content={editContent} setEditContent={setEditContent} fetchContent={fetchContent} />
                )}
            </Box>
        </Container>
    );
};

export default ModifyContent;