import express from 'express';
const router = express.Router();
import { ContentBlock } from '../models/index.js';
import { isRegularAdmin } from '../middleware/isRegularAdmin.js';

// GET all content blocks (Public)
router.get('/', async (req, res) => {
    try {
        const blocks = await ContentBlock.findAll();
        // Convert to key-value object for easy frontend consumption
        const contentMap = {};
        blocks.forEach(block => {
            contentMap[block.key] = block;
        });
        res.json(contentMap);
    } catch (error) {
        console.error('Error fetching content blocks:', error);
        res.status(500).json({ message: 'Failed to fetch content' });
    }
});

// POST create a new content block (Admin only)
router.post('/', isRegularAdmin, async (req, res) => {
    try {
        const { key, type, value } = req.body;
        if (!key || !value) {
            return res.status(400).json({ message: 'Key and value are required' });
        }

        const existing = await ContentBlock.findOne({ where: { key } });
        if (existing) {
            return res.status(400).json({ message: 'Content block with this key already exists' });
        }

        const block = await ContentBlock.create({ key, type, value });
        res.status(201).json({ message: 'Content block created successfully', block });
    } catch (error) {
        console.error('Error creating content block:', error);
        res.status(500).json({ message: 'Failed to create content block' });
    }
});

// PUT update a content block (Admin only)
router.put('/:id', isRegularAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { key, type, value } = req.body;

        const block = await ContentBlock.findByPk(id);
        if (!block) {
            return res.status(404).json({ message: 'Content block not found' });
        }

        if (key && key !== block.key) {
             const existing = await ContentBlock.findOne({ where: { key } });
             if (existing) return res.status(400).json({ message: 'Key already exists' });
        }

        block.key = key || block.key;
        block.type = type || block.type;
        block.value = value || block.value;

        await block.save();

        res.json({ message: 'Content block updated successfully', block });
    } catch (error) {
        console.error('Error updating content block:', error);
        res.status(500).json({ message: 'Failed to update content block' });
    }
});

// DELETE a content block (Admin only)
router.delete('/:id', isRegularAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const block = await ContentBlock.findByPk(id);
        if (!block) {
            return res.status(404).json({ message: 'Content block not found' });
        }

        await block.destroy();
        res.json({ message: 'Content block deleted successfully' });
    } catch (error) {
        console.error('Error deleting content block:', error);
        res.status(500).json({ message: 'Failed to delete content block' });
    }
});

export default router;
