import { Response } from 'express';
import { PanelistService } from '../services/PanelistService';

export const addPanelist = async (req: any, res: Response) => {
    const { roomId } = req.params;
    const { userId } = req.body;

    const result = await PanelistService.addPanelist(roomId, userId);

    if (result.success) {
        res.status(200).json(result);
    } else {
        res.status(400).json(result);
    }
};

export const removePanelist = async (req: any, res: Response) => {
    const { roomId, userId } = req.params;
    const result = await PanelistService.removePanelist(roomId, userId);
    res.status(200).json({ success: true });
};
