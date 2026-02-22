"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePanelist = exports.addPanelist = void 0;
const PanelistService_1 = require("../services/PanelistService");
const addPanelist = async (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;
    const result = await PanelistService_1.PanelistService.addPanelist(roomId, userId);
    if (result.success) {
        res.status(200).json(result);
    }
    else {
        res.status(400).json(result);
    }
};
exports.addPanelist = addPanelist;
const removePanelist = async (req, res) => {
    const { roomId, userId } = req.params;
    const result = await PanelistService_1.PanelistService.removePanelist(roomId, userId);
    res.status(200).json({ success: true });
};
exports.removePanelist = removePanelist;
