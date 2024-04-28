import express from 'express';
import axios from 'axios';
import { processImage } from './imageProcess.js';

const app = express();
app.use(express.json());

app.post('/process-image', async(req, res) => {
    //query url eg https://localhost:3000/process-image?imgUrl=...
    const imgUrl = req.query.imgUrl;
    if (!imgUrl) {
        return res.status(400).json({error: 'Image Is Missing!'});
    }
    console.log('ONDECK: Processing image from URL: ', imgUrl);

    try {
        const response = await axios.get(imgUrl, {responseType: 'stream'});
        if (response.status !== 200){
            return res.status(400).json({error: 'Failed to download Image'});
        }

        const predictions = await processImage(response.data);
        return res.status(200).json({message: 'Image processed successfully', predictions});
    } catch (error) {
        console.log('ONDECK: Error processing image');
        return res.status(500).json({error: 'Error processing the image'});
    }
})

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});