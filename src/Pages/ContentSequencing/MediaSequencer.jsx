import { useState } from 'react';
import { Typography, Box, ToggleButton, Paper } from '@mui/material';
import CreateSequence from './CreateSequence';
import ModifySequences from './ModifySequences';

/**
 * MediaSequencer component handles the creation and modification of media sequences.
 * Users can toggle between creating a new sequence and modifying existing sequences.
 */
const MediaSequencer = () => {
    const [view, setView] = useState('create');

    return (
        <Box sx={{ 
            maxWidth: '1000px', 
            margin: '0 auto', 
            padding: '30px 20px',
            backgroundColor: '#fff'
        }}>
            <Typography 
                variant="h4" 
                component="h1" 
                align="center" 
                sx={{ 
                    fontWeight: 500, 
                    mb: 4,
                    color: '#000' 
                }}
            >
                Media Sequencer
            </Typography>
            
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 3 
            }}>
                <Box sx={{ 
                    maxWidth: '500px', 
                    width: '100%', 
                    display: 'flex' 
                }}>
                    <ToggleButton
                        value="create"
                        selected={view === 'create'}
                        onClick={() => setView('create')}
                        sx={{
                            flex: 1,
                            height: '40px',
                            backgroundColor: view === 'create' ? '#000' : '#f5f5f5',
                            color: view === 'create' ? '#fff' : '#000',
                            '&:hover': { 
                                backgroundColor: '#8C1D40', 
                                color: '#fff',
                                borderColor: '#8C1D40'
                            },
                            borderRadius: '0',
                            padding: '10px 0',
                            fontSize: '16px',
                            fontWeight: 'normal',
                            textTransform: 'none',
                            transition: 'all 0.3s ease',
                            border: '1px solid #ddd'
                        }}
                    >
                        Create New Sequence
                    </ToggleButton>
                    <ToggleButton
                        value="modify"
                        selected={view === 'modify'}
                        onClick={() => setView('modify')}
                        sx={{
                            flex: 1,
                            height: '40px',
                            backgroundColor: view === 'modify' ? '#000' : '#f5f5f5',
                            color: view === 'modify' ? '#fff' : '#000',
                            '&:hover': { 
                                backgroundColor: '#8C1D40', 
                                color: '#fff',
                                borderColor: '#8C1D40'
                            },
                            borderRadius: '0',
                            padding: '10px 0',
                            fontSize: '16px',
                            fontWeight: 'normal',
                            textTransform: 'none',
                            transition: 'all 0.3s ease',
                            border: '1px solid #ddd'
                        }}
                    >
                        Modify Existing Sequence
                    </ToggleButton>
                </Box>
            </Box>
            
            <Paper 
                elevation={1} 
                sx={{ 
                    p: 3, 
                    margin: '0 auto', 
                    borderRadius: '4px', 
                    border: '1px solid #eee'
                }}
            >
                {view === 'create' && <CreateSequence />}
                {view === 'modify' && <ModifySequences />}
            </Paper>
        </Box>
    );
};

export default MediaSequencer;