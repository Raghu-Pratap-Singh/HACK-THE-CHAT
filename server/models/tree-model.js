const mongoose = require("mongoose");


const treeSchema = new mongoose.Schema({
    userid : {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"user"
    },
    strong : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        
    ],
    moderate : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    weak : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ]
})

module.exports = mongoose.model("tree", treeSchema);