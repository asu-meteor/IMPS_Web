import { useState } from 'react';
import { Container, Typography, Box, TextField, MenuItem } from '@mui/material';
import UploadVideo from './UploadVideo';
import UploadModel from './UploadModel';

const UploadContent = () => {
    const [contentType, setContentType] = useState('video');

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" color='black' gutterBottom>
                    Add New Media
                </Typography>
                <TextField
                    select
                    label="Content Type"
                    fullWidth
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    sx={{ mb: 2 }}
                >
                    <MenuItem value="video">Video</MenuItem>
                    <MenuItem value="model">Model</MenuItem>
                </TextField>
                {contentType === 'video' && <UploadVideo />}
                {contentType === 'model' && <UploadModel/>}
            </Box>
        </Container>
    );
};

export default UploadContent;