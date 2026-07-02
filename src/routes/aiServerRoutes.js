import express from 'express';
const router = express.Router();
import { AiServer } from '../models/index.js';
import { isAdmin } from '../middleware/isAdmin.js';

// GET all AI servers (Public)
router.get('/', async (req, res) => {
    try {
        const servers = await AiServer.findAll({
            where: { is_active: true },
            order: [['monthly_price', 'ASC']]
        });
        res.json(servers);
    } catch (error) {
        console.error('Error fetching AI servers:', error);
        res.status(500).json({ message: 'Server error fetching AI servers' });
    }
});

// GET all AI servers (Admin - includes inactive)
router.get('/admin', isAdmin, async (req, res) => {
    try {
        const servers = await AiServer.findAll({
            order: [['monthly_price', 'ASC']]
        });
        res.json(servers);
    } catch (error) {
        console.error('Error fetching AI servers for admin:', error);
        res.status(500).json({ message: 'Server error fetching AI servers' });
    }
});

// POST create a new AI server (Admin only)
router.post('/', isAdmin, async (req, res) => {
    try {
        const { name, monthly_price, cpu, ram, storage, gpu, network, support, is_active } = req.body;
        const newServer = await AiServer.create({
            name, monthly_price, cpu, ram, storage, gpu, network, support, is_active
        });
        res.status(201).json(newServer);
    } catch (error) {
        console.error('Error creating AI server:', error);
        res.status(500).json({ message: 'Server error creating AI server' });
    }
});

// PUT update an AI server (Admin only)
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const server = await AiServer.findByPk(req.params.id);
        if (!server) {
            return res.status(404).json({ message: 'AI Server not found' });
        }
        await server.update(req.body);
        res.json(server);
    } catch (error) {
        console.error('Error updating AI server:', error);
        res.status(500).json({ message: 'Server error updating AI server' });
    }
});

// DELETE an AI server (Admin only)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const server = await AiServer.findByPk(req.params.id);
        if (!server) {
            return res.status(404).json({ message: 'AI Server not found' });
        }
        await server.destroy();
        res.json({ message: 'AI Server deleted successfully' });
    } catch (error) {
        console.error('Error deleting AI server:', error);
        res.status(500).json({ message: 'Server error deleting AI server' });
    }
});

export default router;
