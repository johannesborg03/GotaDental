var express = require ('express');
var router = express.Router();
var { subscribeToTopic } = require('../events/subscriber');
//const Office = require('../models/Office');

router.get('/api/offices', async function (req, res) {
    try {
        const offices = await Office.find();
        res.status(200).json(offices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offices', error: error.message });
    }
});

exports.getOfficeById = async (req, res) => {
    try {
        const office = await Office.findOne({ office_id: req.params.office_id });
        if (!office) {
            return res.status(404).json({ message: 'Office not found' });
        }
        res.status(200).json({
            message: 'Office details retrieved successfully',
            office,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error while retrieving office details', error: error.message });
    }
};

module.exports = router;