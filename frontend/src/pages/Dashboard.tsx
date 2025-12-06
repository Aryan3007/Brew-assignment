import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { TaskDialog } from '../components/TaskDialog';
import { Plus, Search, LogOut, Trash2, Edit, CheckCircle2, Circle, Clock, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<any>(null);

    const fetchTasks = async () => {
        try {
            const params: any = {};
            if (filterStatus !== 'All') params.status = filterStatus;
            if (search) params.search = search;

            const { data } = await api.get('/tasks', { params });
            setTasks(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [filterStatus, search]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/tasks/${id}`);
            fetchTasks();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (task: any) => {
        setTaskToEdit(task);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setTaskToEdit(null);
        setIsDialogOpen(true);
    };

    // Stats Calculation
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'Done').length;
    const pendingTasks = totalTasks - completedTasks;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 font-sans">
            {/* Navbar */}
            <nav className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <LayoutDashboard className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">TaskTracker</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium hidden sm:block">
                        {user?.email}
                    </span>
                    <Button variant="ghost" size="sm" onClick={logout} className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 text-gray-500">
                        <LogOut className="w-4 h-4 mr-2" />
                    </Button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Header & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                        <p className="text-muted-foreground">Manage your tasks and track progress.</p>
                    </div>

                    {/* Stats Cards */}
                    <Card className="bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalTasks}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 dark:from-primary/5 dark:to-purple-500/5 border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-950 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 sticky top-20 z-40 backdrop-blur-sm bg-opacity-95">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-10 bg-gray-50/50 dark:bg-gray-900 focus-visible:ring-primary/20 border-gray-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[160px] bg-white dark:bg-gray-900 border-gray-200"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="To Do">To Do</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Done">Done</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleCreate} className="w-full md:w-auto shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <Plus className="w-4 h-4 mr-2" /> New Task
                        </Button>
                    </div>
                </div>

                {/* Task Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {tasks.map((task: any) => (
                            <motion.div
                                key={task._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="group pt-0 h-full flex flex-col hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
                                    <div className={`h-4 w-full ${task.priority === 'high' ? 'bg-red-500' :
                                            task.priority === 'medium' ? 'bg-orange-400' : 'bg-blue-400'
                                        }`} />
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <Badge variant="outline" className={`${task.status === 'Done' ? 'text-green-600 border-green-200 bg-green-50' :
                                                    task.status === 'In Progress' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                                                        'text-gray-600 border-gray-200 bg-gray-50'
                                                } mb-2`}>
                                                {task.status}
                                            </Badge>
                                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold">
                                                {task.priority}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                            {task.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                                            {task.description || "No description provided."}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-950/50">
                                       
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(task)} className="h-8 w-8 text-blue-600 bg-blue-100/50">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(task._id)} className="h-8 w-8 text-red-600 bg-red-100/50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {tasks.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-950 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800"
                        >
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-full mb-4">
                                <LayoutDashboard className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No tasks found</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1 mb-6">
                                {search || filterStatus !== 'All'
                                    ? "Try adjusting your filters or search terms."
                                    : "Get started by creating your first task to track your progress."}
                            </p>
                            {(search || filterStatus !== 'All') ? (
                                <Button variant="outline" onClick={() => { setSearch(''); setFilterStatus('All') }}>
                                    Clear Filters
                                </Button>
                            ) : (
                                <Button onClick={handleCreate}>
                                    <Plus className="w-4 h-4 mr-2" /> Create Task
                                </Button>
                            )}
                        </motion.div>
                    )}
                </div>

                <TaskDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    refreshTasks={fetchTasks}
                    taskToEdit={taskToEdit}
                />
            </main>
        </div>
    );
}
