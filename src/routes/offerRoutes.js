import express from 'express';
const router = express.Router();
import { Offer } from '../models/index.js';
import { isRegularAdmin } from '../middleware/isRegularAdmin.js';

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
router.put('/:id', isRegularAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, discount, min_vcpu, min_ram, 
            product_category, status, start_date, end_date, description, image_url 
        } = req.body;

        const offer = await Offer.findByPk(id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        offer.name = name !== undefined ? name : offer.name;
        offer.discount = discount !== undefined ? discount : offer.discount;
        offer.min_vcpu = min_vcpu !== undefined ? min_vcpu : offer.min_vcpu;
        offer.min_ram = min_ram !== undefined ? min_ram : offer.min_ram;
        offer.product_category = product_category !== undefined ? product_category : offer.product_category;
        offer.status = status !== undefined ? status : offer.status;
        offer.start_date = start_date !== undefined ? start_date : offer.start_date;
        offer.end_date = end_date !== undefined ? end_date : offer.end_date;
        offer.description = description !== undefined ? description : offer.description;
        offer.image_url = image_url !== undefined ? image_url : offer.image_url;

        await offer.save();

        res.json({ message: 'Offer updated successfully', offer });
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ message: 'Failed to update offer' });
    }
});

// POST create a new offer (Admin only)
router.post('/', isRegularAdmin, async (req, res) => {
    try {
        const { 
            name, discount, min_vcpu, min_ram,
            product_category, status, start_date, end_date, description, image_url 
        } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Offer name is required' });
        }

        const offer = await Offer.create({
            name,
            discount: discount || 0,
            min_vcpu: min_vcpu || 1,
            min_ram: min_ram || 1,
            product_category: product_category || 'Enterprise Servers',
            status: status || 'Draft',
            start_date: start_date || null,
            end_date: end_date || null,
            description: description || null,
            image_url: image_url || null
        });

        res.status(201).json({ message: 'Offer created successfully', offer });
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).json({ message: 'Failed to create offer' });
    }
});

// DELETE an offer (Admin only)
router.delete('/:id', isRegularAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const offer = await Offer.findByPk(id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        await offer.destroy();
        res.json({ message: 'Offer deleted successfully' });
    } catch (error) {
        console.error('Error deleting offer:', error);
        res.status(500).json({ message: 'Failed to delete offer' });
    }
});

export default router;
