import * as tf from '@tensorflow/tfjs-node';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import sharp from 'sharp';

async function processImage(imageStream) {
    console.log('Starting Image Processing');
    const chunks = []; 

    for await (const chunk of imageStream){
        console.log("Received chunk: ", chunk.length);
        chunks.push(chunk);
    }
    console.log("Received all chunks");
    const imageBuffer = Buffer.concat(chunks);
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();

    console.log('Loading model...');
    const model = await cocoSsd.load();

    // decode the image into a tensor
    const tensor = tf.node.decodeImage(pngBuffer).toFloat().expandDims(0);

    // resize image to 300*300
    const resizedTensor = tf.image.resizeBilinear(tensor, [300, 300]);

    // expand dims to match model input shape
    const expandedTensor = resizedTensor.asType('int32');

    // squeeze dims 
    const reshapedTensor = expandedTensor.squeeze([0]);

    // make prediction
    const predictions = await model.detect(reshapedTensor);

    // clean up tensor
    tensor.dispose();
    resizedTensor.dispose();
    expandedTensor.dispose();

    return predictions;
}

export { processImage };