import express from 'express';
const router = express.Router();
import { Offer } from '../models/index.js';
import { isAdmin } from '../middleware/isAdmin.js';

// GET all offers
router.get('/', async (req, res) => {
    try {
        const offers = await Offer.findAll({
            order: [['discount', 'DESC']]
        });
        res.json(offers);
    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).json({ message: 'Failed to fetch offers' });
    }
});

// PUT update an offer (Admin only)
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { discount, min_vcpu, min_ram } = req.body;

        const offer = await Offer.findByPk(id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        offer.discount = discount !== undefined ? discount : offer.discount;
        offer.min_vcpu = min_vcpu !== undefined ? min_vcpu : offer.min_vcpu;
        offer.min_ram = min_ram !== undefined ? min_ram : offer.min_ram;

        await offer.save();

        res.json({ message: 'Offer updated successfully', offer });
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ message: 'Failed to update offer' });
    }
});

export default router;
