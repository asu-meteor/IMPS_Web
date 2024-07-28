import { Container, Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import styles from './Home.module.css';
import { Link } from 'react-router-dom';


function Home() {
    return (
        <Container className={styles.homeContainer}>
            <Box className={styles.headerBox}>
                <Typography variant="h2" className={styles.title}>
                    Immersive Media Player System - AR
                </Typography>
                <Typography variant="h6" className={styles.subtitle}>
                    This Database Management platform allows instructors to manage their media, upload new content, and sequence it for an immersive learning experience in the VR app.
                </Typography>
            </Box>

            <Box className={styles.introductionBox}>
                <Typography variant="h4" className={styles.sectionTitle}>
                    What is IMPS AR?
                </Typography>
                <Typography variant="body1" className={styles.introductionText}>
                    IMPS AR Semiconductor Metrology is designed to revolutionize the educational experience in semiconductor metrology at Arizona State University. This cutting-edge Unity application harnesses the power of Augmented Reality to deliver immersive, interactive learning sessions led by an Instructor.
                </Typography>
                <Typography variant="body1" className={styles.introductionText}>
                    During these sessions, students access various immersive media curated by the Instructor, including images, videos, and 3D models. These media components enhance the understanding of metrology concepts and the operation of semiconductor metrology equipment, by allowing the student to manipulate and interact with them.
                </Typography>
            </Box>

            <Box className={styles.sectionBox}>
                <Typography variant="h4" className={styles.sectionTitle}>
                    Dashboards
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card className={styles.card}>
                            <CardContent>
                                <Typography variant="h5" className={styles.cardTitle}>
                                    Media Manager
                                </Typography>
                                <Typography variant="h6" className={styles.cardDescription}>
                                    Access the Media Manager to upload new Videos or 3D Models or modify existing ones. 
                                </Typography>
                                <Link to='/IMPS/Media-Manager'>
                                    <Button className={styles.cardButton} variant="contained">
                                        MEDIA MANAGER
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card className={styles.card}>
                            <CardContent>
                                <Typography variant="h5" className={styles.cardTitle}>
                                    Media Sequencer
                                </Typography>
                                <Typography variant="h6" className={styles.cardDescription}>
                                    Use the Media Sequencer to group and order your media into sequences or lectures.
                                </Typography>
                                <Link to='/IMPS/Media-Sequencer'>
                                    <Button className={styles.cardButton} variant="contained">
                                        MEDIA SEQUENCER
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            <Box className={styles.sectionBox}>
                <Typography variant="h4" className={styles.sectionTitle}>
                    Tutorial Video
                </Typography>
                <Typography variant="body1" className={styles.placeholderText}>
                    [Coming Soon]
                </Typography>
            </Box>
        </Container>
    );
}

export default Home;