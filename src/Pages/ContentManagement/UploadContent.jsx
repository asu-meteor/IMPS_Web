import { useState } from 'react';
import { Typography, Box, TextField, MenuItem, Grid, Paper } from '@mui/material';
import UploadVideo from './UploadVideo';
import UploadModel from './UploadModel';

/**
 * UploadContent component provides a user interface for uploading new media content.
 * Users can select the type of content (video or model) and upload it accordingly.
 */
const UploadContent = () => {
    const [contentType, setContentType] = useState('video');

    return (
        <Box>
            <Typography variant="h6" component="h2" align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
                Add New Media
            </Typography>
            
            <Paper elevation={0} sx={{ 
                border: '1px solid #eee',
                borderRadius: '4px',
                padding: 3
            }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                select
                                label="Content Type"
                                fullWidth
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value)}
                                InputProps={{
                                    sx: { height: '56px' }
                                }}
                            >
                                <MenuItem value="video">Video</MenuItem>
                                <MenuItem value="model">Model</MenuItem>
                            </TextField>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        {contentType === 'video' && <UploadVideo />}
                        {contentType === 'model' && <UploadModel/>}
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default UploadContent;