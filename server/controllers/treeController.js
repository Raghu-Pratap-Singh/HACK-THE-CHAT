const treeModel = require("../models/tree-model");

async function get_tree_links(req, res) {
    try {
        let id = req.params.id;

        if (!id) {
            return res.status(400).json({ error: "Bad request" });
        }

        let admin_tree = await treeModel.findOne({ userid: id });
        if (!admin_tree) {
            return res.status(404).json({ error: "no record found" });
        }

        await admin_tree.populate([
            { path: "strong weak moderate", select: "username -_id" }
        ])

        let up_strong = [];
        let up_moderate = [];
        let up_weak = [];

        for (let i = 0; i<admin_tree.strong.length; i++) {
            up_strong.push(admin_tree.strong[i].username);
        }
        for (let i = 0; i<admin_tree.moderate.length; i++) {
            up_moderate.push(admin_tree.moderate[i].username);
        }
        for (let i = 0; i<admin_tree.weak.length; i++) {
            up_weak.push(admin_tree.weak[i].username);
        }

        return res.status(200).json({
            ok: true,
            strong: up_strong,
            moderate: up_moderate,
            weak: up_weak
        })

    } catch (err) {
        return res.status(500).json({error : "Server error"})
    }
}

module.exports.get_tree_links = get_tree_links;