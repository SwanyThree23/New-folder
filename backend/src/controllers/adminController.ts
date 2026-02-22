import { Response } from 'express';
import { AdminService } from '../services/AdminService';

/**
 * @desc    Get full system telemetry for Mission Control
 * @route   GET /api/admin/telemetry
 * @access  Private (Admin Only)
 */
export const getTelemetry = async (req: any, res: Response) => {
    try {
        const systems = await AdminService.getSystemState();
        const logs = await AdminService.getLatestLogs();
        const agents = AdminService.getActiveAgents();

        res.json({
            systems,
            logs,
            agents,
            timestamp: new Date()
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
