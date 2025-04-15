import { useState } from 'react';
import { Typography, Box, ToggleButton, Paper } from '@mui/material';
import UploadContent from './UploadContent';
import ModifyContent from './ModifyContent';

/**
 * MediaManager component provides a user interface for managing media content.
 * Users can toggle between uploading new media and modifying existing media.
 */
const MediaManager = () => {
    const [view, setView] = useState('upload');

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
                Media Manager
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
                        value="upload"
                        selected={view === 'upload'}
                        onClick={() => setView('upload')}
                        sx={{
                            flex: 1,
                            height: '40px',
                            backgroundColor: view === 'upload' ? '#000' : '#f5f5f5',
                            color: view === 'upload' ? '#fff' : '#000',
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
                            border: '1px solid #ddd',
                            borderRight: 0
                        }}
                    >
                        Add New Media
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
                        Modify Existing Media
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
                {view === 'upload' && <UploadContent />}
                {view === 'modify' && <ModifyContent />}
            </Paper>
        </Box>
    );
};

export default MediaManager;