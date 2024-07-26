import { useState } from 'react';
import { Container, Typography, Box, ToggleButton, Grid } from '@mui/material';
import UploadContent from './UploadContent';
import ModifyContent from './ModifyContent';

const MediaManager = () => {
    const [view, setView] = useState('upload');


    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Manage Content
                </Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                        <ToggleButton
                            value="upload"
                            selected={view === 'upload'}
                            onClick={() => setView('upload')}
                            sx={{
                                width: '100%',
                                height: '40px',
                                backgroundColor: view === 'upload' ? '#000' : '#f5f5f5',
                                color: view === 'upload' ? '#fff' : '#000',
                                '&:hover': { backgroundColor: '#333', color: '#fff' },
                                borderRadius: '5px',
                                padding: '10px 0',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                textTransform: 'none'
                            }}
                        >
                            Add New Media
                        </ToggleButton>
                    </Grid>
                    <Grid item xs={6}>
                        <ToggleButton
                            value="modify"
                            selected={view === 'modify'}
                            onClick={() => setView('modify')}
                            sx={{
                                width: '100%',
                                height: '40px',
                                backgroundColor: view === 'modify' ? '#000' : '#f5f5f5',
                                color: view === 'modify' ? '#fff' : '#000',
                                '&:hover': { backgroundColor: '#333', color: '#fff' },
                                borderRadius: '5px',
                                padding: '10px 0',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                textTransform: 'none'
                            }}
                        >
                            Modify Existing Media
                        </ToggleButton>
                    </Grid>
                </Grid>
                {view === 'upload' && <UploadContent />}
                {view === 'modify' && <ModifyContent />}
            </Box>
        </Container>
    );
};

export default MediaManager;