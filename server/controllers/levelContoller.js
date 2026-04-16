const userModel = require("../models/user-model");
const { get_level, get_log_score } = require("../utils/logScore");
async function initial_badge_and_score (req,res) {
    try {

        let id = req.params.id;
        if (!id) {
            return res.status(400).json({error : "id not sent"});
        }
        let user = await userModel.findById(id);
        if (!user) {
            return res.stat(404).json({error : "user not found"});
        }
        // get log score
        const log_score = get_log_score(user);
        // get badge name using log score
        const title = get_level(log_score);
        await userModel.updateOne({
            _id : id
        },{
            $set : {
                level : title,
                logScore : log_score
            }
        })
        const badge_url = `/badges/${title}.png`;
        return res.status(200).json({ok:true, badge_url : badge_url, score: log_score})

    } catch (err) {
        console.error(err)
        return res.status(500).json({error : "Server error"});
    }
    
}

async function get_leaders (req,res) {
    try {
        let leaders = await userModel.find().select("username logScore level -_id").sort({logScore : -1}).limit(200)
        // get top 200 across 
        return res.status(200).json({ok : true, leaders : leaders})
    } catch (err) {
        return res.status(500).json({error : "Server error"})
    }
}
module.exports.initial_badge_and_score = initial_badge_and_score;
module.exports.get_leaders = get_leaders;