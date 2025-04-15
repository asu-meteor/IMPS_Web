import { useState, useEffect, useCallback } from 'react';
import { Typography, Box, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Grid } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../Firebase';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import EditVideo from './EditVideo';
import EditModel from './EditModel';

// Function to format duration in MM:SS format
const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

/**
 * ModifyContent component allows the user to view and edit existing video and model content.
 * Users can select the type of content, view details in a table, and edit or delete the content.
 */
const ModifyContent = () => {
    const { currentUser } = useAuth();
    const [contentType, setContentType] = useState('Video');
    const [contentList, setContentList] = useState([]);
    const [editContent, setEditContent] = useState(null);

    /**
     * Fetches content from Firestore based on the selected content type.
     */
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

    /**
     * Handles edit button click by setting the selected content for editing.
     * 
     * @param {object} content - The content to be edited.
     */
    const handleEditClick = (content) => {
        setEditContent(content);
    };

    return (
        <Box>
            <Typography variant="h6" component="h2" align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
                Modify Existing Media
            </Typography>
            
            <TextField
                select
                label="Content Type"
                fullWidth
                value={contentType}
                onChange={(e) => { setContentType(e.target.value); setEditContent(null); }}
                sx={{ mb: 3 }}
                InputProps={{
                    sx: { height: '56px' }
                }}
            >
                <MenuItem value="Video">Video</MenuItem>
                <MenuItem value="Model">Model</MenuItem>
            </TextField>
            
            {!editContent ? (
                <TableContainer component={Paper} sx={{ mt: 2, mb: 2, border: '1px solid #eee', boxShadow: 'none' }}>
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
                                        <Button 
                                            variant="contained" 
                                            sx={{ 
                                                backgroundColor: '#8C1D40', 
                                                color: '#fff',
                                                fontWeight: 'normal',
                                                '&:hover': { backgroundColor: '#6a1430' }
                                            }} 
                                            onClick={() => handleEditClick(content)}
                                        >
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
    );
};

export default ModifyContent;