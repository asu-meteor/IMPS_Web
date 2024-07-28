import { useState } from 'react';
import { Container, Typography, Box, ToggleButton, Grid } from '@mui/material';
import CreateSequence from './CreateSequence';
import ModifySequences from './ModifySequences';

const MediaSequencer = () => {
    const [view, setView] = useState('create');


    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Content Sequencer
                </Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                        <ToggleButton
                            value="create"
                            selected={view === 'create'}
                            onClick={() => setView('create')}
                            sx={{
                                width: '100%',
                                height: '40px',
                                backgroundColor: view === 'upload' ? '#000' : '#f5f5f5',
                                color: view === 'create' ? '#fff' : '#000',
                                '&:hover': { backgroundColor: '#333', color: '#fff' },
                                borderRadius: '5px',
                                padding: '10px 0',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                textTransform: 'none'
                            }}
                        >
                            Create new Sequence
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
                            Modify Existing Sequence
                        </ToggleButton>
                    </Grid>
                </Grid>
                {view === 'create' && <CreateSequence />}
                {view === 'modify' && <ModifySequences />}
            </Box>
        </Container>
    );
};

export default MediaSequencer;