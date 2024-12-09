const Office = require('../models/Office');

exports.getAllOffices = async (req, res) => {
    try {
        const offices = await Office.find({}, 'office_id office_name latitude longitude dentists');
        if (!offices.length) {
            return res.status(404).json({ message: 'No offices found', offices: [] });
        }
        res.status(200).json({ message: 'Offices retrieved successfully', offices });
    } catch (error) {
        res.status(500).json({ message: 'Server error while retrieving offices', error: error.message });
    }
};

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
