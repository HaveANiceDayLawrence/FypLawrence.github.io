const { path } = require('express/lib/application');
const mongoose = require('mongoose');
const { stringify } = require('nodemon/lib/utils');
const Schema = mongoose.Schema; //export mongoose.Schema to a variable

const defectSchema = new Schema({ //create a defect Schema, like a defect object, used to define the structure 
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        default: ""
    },
    img1:{
        data: String,
        contentType: String
    },
    img2:{
        data: String,
        contentType: String
    },
    date: {
        type: Date,
        default: new Date()
    },
    results: {
        type: String,
        default: "No Defects"
    }
    
}, {timrstamps: true})

//Model will based on this schema, create a UI on mongo altas, which easy to edit
const Defect_Model = mongoose.model('Defect', defectSchema) //model(<collection name in singular>, <collection's scheme>)

//export model
module.exports = Defect_Model