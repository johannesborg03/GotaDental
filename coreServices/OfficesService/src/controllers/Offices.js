var express = require ('express');
var router = express.Router();
var { subscribeToTopic } = require('../events/subscriber');
//const Office = require('../models/Office');

router.get('/api/offices', async function (req, res) {
    try {
        const offices = await Office.find({}, 'office_id office_name latitude longitude');
        if (offices.length === 0) {
            return res.status(404).json({message: "No offices found", offices: []});
        }

        res.status(200).json({message: "Offices retrieved successfully", offices: offices});
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offices', error: error.message });
    }
});

router.get('/api/offices/:office_id', async function (req, res) {

    try {
        const office = await Office.findOne({ office_id: req.params.office_id });
        if (!office) {
            return res.status(404).json({ message: 'Office not found' });
        }
        res.status(200).json({
            message: 'Office details retrieved successfully',
            office: {
                office_id: office.office_id,
                office_name: office.office_name,
                office_address: office.office_address,
                dentist_name: office.dentist_username.name
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error while retrieving office details', error: error.message });
    }
});

module.exports = router;