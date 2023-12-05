const User = require('../../models/User');
const router = require('express').Router();
const authenticate = require('../../middleware/authenticate');
const Cooperative = require('../../models/Cooperative');

router.get("/getUnconfirmedDrivers", authenticate, function(req, res) {
    const coopId = req.user.coopId;
    const isAdmin = req.user.isAdmin;
    if (!isAdmin) {
        return res.status(200).send({ success: false, message: "Yetkisiz işlem!" });
    }
    User.find({ coopId: coopId, confirmed: false }).exec()
    .then(users => {
        res.status(200).send({ uccess: true, users });
    })
});

router.post("/confirmDriver", authenticate, function(req, res) {
    const coopId = req.user.coopId;
    const isAdmin = req.user.isAdmin;
    const userId = req.body.userId;
    if (!isAdmin) {
        return res.status(409).send({ success: false, message: "Yetkisiz işlem!" });
    }
    User.findOneAndUpdate({ coopId: coopId, userId: userId }, { confirmed: true }).exec()
    .then(user => {
        // add user to coopDriverQueue
        Cooperative.findOne({ coopId: coopId }).exec()
        .then(coop => {
            let queue = JSON.parse(coop.coopDriverQueue);
            queue.push(user.userId);
            Cooperative.findOneAndUpdate({ coopId: coopId }, { coopDriverQueue: JSON.stringify(queue) }).exec()
            .then(() => {
                res.status(200).send({ success: true, user });
            })
        })
        res.status(200).send({ success: true });
    }).catch(err => {
        res.status(200).send({ success: false, message: err.message });
    })
});

router.post("/declineDriver", authenticate, function(req, res) {
    const coopId = req.user.coopId;
    const isAdmin = req.user.isAdmin;
    const userId = req.body.userId;
    if (!isAdmin) {
        return res.status(200).send({ success: false, message: "Yetkisiz işlem!" });
    }
    console.log(39, req.body);
    User.findOneAndDelete({ coopId: coopId, userId: userId }).exec()
    .then(user => {
        res.status(200).send({ success: true, user });
    })
});

module.exports = router;