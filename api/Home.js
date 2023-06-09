// @ts-nocheck
const { response } = require("express");
const express = require("express");
const Home = require("../Models/home");
const router = express.Router();
var cloudinary = require('cloudinary').v2;
const cheackUser = require("../Middlewears/Authorizations")
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    secure: true
});

//addgallery image private api
router.post("/addhomecarousel", cheackUser, async (req, res) => {
    const { title, image } = req.body;
    try {
        const file1 = await cloudinary.uploader.upload(image);
        const newImage = Home({
            title: title,
            image: {
                public_id: file1.public_id,
                url: file1.url
            }
        })
        newImage.save().then((val) => {
            res.status(200).send(val)
        }).catch((err) => {
            res.status(400).send(err)
        })
    }
    catch {
        res.status(400).send("sorry error occured..")
    }
})

//read public api
router.get('/gethomecarousel', (req, res) => {
    Home.find().then((val) => {
        res.status(200).send(val)
    }).catch((err) => {
        res.status(404).send(err)
    })
})

//delete 
router.post('/deletehomecarousel', cheackUser, (req, response) => {
    const { id } = req.body;
    Home.findById(id).then((val) => {
        cloudinary.uploader
            .destroy(val.image.public_id)
            .then((result) => {
                Home.findByIdAndDelete(id, (err, docs) => {
                    if (err) {
                        response.status(400).send("Error in document deletion..")
                    }
                    else {
                        response.status(200).send("Opertaion sucsessfully..")
                    }
                })
            })
            .catch((error) => {
                response.status(400).send({
                    message: "Failure",
                    error,
                });
            });
    }).catch((err) => {
        response.status(400).send(err)
    })
})

module.exports = router;