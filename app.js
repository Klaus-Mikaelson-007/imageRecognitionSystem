const express = require('express')
const jpeg = require('jpeg-js')
const fs = require('fs')
const fileUpload = require('express-fileupload')


require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const tensorflow = require('@tensorflow/tfjs')
const mobilenet = require('@tensorflow-models/mobilenet')
const coco = require('@tensorflow-models/coco-ssd')


const app = express()
const port = process.env.port || 3000;

app.use(express.json());
app.use(express.static(__dirname+'/public'));
app.use(fileUpload({
    limits: {
        fileSize: 10 * 1024 * 1024
    }
}))


process.on('uncaughtException', (error, origin) => {
    console.log('----- Uncaught exception -----')
    console.log(error)
    console.log('----- Exception origin -----')
    console.log(origin)
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----')
    console.log(promise)
    console.log('----- Reason -----')
    console.log(reason)
})




app.get("/", (req, res) => {
    res.sendFile(__dirname + "\\index.html");
})

app.post("/", (req, res) => {
    upload(req.files.image).then((file) => {
        image(file)
        .then((result) => {
            res.send(result)
        })
    })
})


app.listen(port, () => {
    console.log(`Server started at port ${port}`)
})


async function upload(inputFile) {
    try {
        let file = inputFile;
        let filePath = `./public/uploads/${file.name}`
        await file.mv(filePath);

        return file;
    } catch (err) {
        console.log(err);
    }
}

async function image(file) {
    try {

        console.log(file)
        let image = fs.readFileSync(`./public/uploads/${file.name}`);
        
        let decodedImage;

        fs.unlinkSync(`./public/uploads/${file.name}`);

        if (file.mimetype == 'image/jpeg') {
            decodedImage = jpeg.decode(image, true)
            const model = await mobilenet.load();
            const predictions = await model.classify(decodedImage);

            const cocomodel = await coco.load();
            const objectsinImage = await cocomodel.detect(decodedImage);
            
            let name = predictions[0].className.split(',', 1);
            name = name[0]


            let prediction = {
                name: name,
                probability: parseFloat((predictions[0].probability) * 100).toFixed(2)
            }

            let objects = [];

            objectsinImage.forEach((object) => {
                objects.push({
                    name: object.class,
                    score: parseFloat((object.score) * 100).toFixed(2)
                })
            })

            let result = {
                prediction : prediction,
                objects : objects
            }
            
            console.log(result)
            return result
        }


    } catch (err) {
        console.log(err);
    }
}
