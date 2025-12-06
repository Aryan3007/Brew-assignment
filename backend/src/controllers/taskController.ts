import { Request, Response } from 'express';
import Task from '../models/Task';

// @desc    Get tasks (with filter/search)
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { status, search } = req.query;

    let query: any = { user: user._id };

    if (status && status !== 'All') {
        query.status = status;
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    try {
        const tasks = await Task.find(query).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req: Request, res: Response): Promise<any> => {
    const user = (req as any).user;
    const { title, description, dueDate, priority, status } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Please add a title' });
    }

    try {
        const task = await Task.create({
            user: user._id,
            title,
            description,
            dueDate,
            priority,
            status
        });
        res.status(201).json(task);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: Request, res: Response): Promise<any> => {
    const user = (req as any).user;
    const { id } = req.params;

    try {
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check for user
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the task user
        if (task.user.toString() !== user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        res.status(200).json(updatedTask);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req: Request, res: Response): Promise<any> => {
    const user = (req as any).user;
    const { id } = req.params;

    try {
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (task.user.toString() !== user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await task.deleteOne();

        res.status(200).json({ id: id });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
