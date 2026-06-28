import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getBoard } from '../api/boards';
import { getTasks, createTask, updateTask, deleteTask, suggestEstimate } from '../api/tasks';

const COLUMNS = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

const PRIORITIES = ['low', 'medium', 'high'];

const priorityColor = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const BoardView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'medium', dueDate: '', status: 'todo', estimatedEffort: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('none');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [boardRes, tasksRes] = await Promise.all([
        getBoard(id),
        getTasks(id),
      ]);
      setBoard(boardRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      setError('Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (status = 'todo') => {
    setEditTask(null);
    setAiSuggestion(null);
    setFormData({ title: '', description: '', priority: 'medium', dueDate: '', status, estimatedEffort: '' });
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setAiSuggestion(null);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      status: task.status,
      estimatedEffort: task.estimatedEffort || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTask) {
        const res = await updateTask(editTask._id, formData);
        setTasks(tasks.map((t) => t._id === editTask._id ? res.data : t));
      } else {
        const res = await createTask({ ...formData, boardId: id });
        setTasks([res.data, ...tasks]);
      }
      setShowModal(false);
    } catch (err) {
      setError('Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleMoveTask = async (task, newStatus) => {
    try {
      const res = await updateTask(task._id, { status: newStatus });
      setTasks(tasks.map((t) => t._id === task._id ? res.data : t));
    } catch (err) {
      setError('Failed to move task');
    }
  };

  const handleSuggestEstimate = async () => {
    if (!formData.title) {
      setError('Please enter a task title first');
      return;
    }
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await suggestEstimate({
        title: formData.title,
        description: formData.description,
      });
      setAiSuggestion(res.data);
    } catch (err) {
      setError('AI suggestion failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (!aiSuggestion) return;
    setFormData({
      ...formData,
      estimatedEffort: aiSuggestion.effort,
      dueDate: aiSuggestion.suggestedDueDate,
    });
    setAiSuggestion(null);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getFilteredTasks = (status) => {
    let filtered = tasks.filter((t) => t.status === status);

    if (filterPriority !== 'all') {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }

    if (sortBy === 'priority') {
      const order = { high: 0, medium: 1, low: 2 };
      filtered = [...filtered].sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sortBy === 'dueDate') {
      filtered = [...filtered].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    }

    return filtered;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {board?.title}
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Filter and Sort Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Filter:</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">Default</option>
              <option value="priority">By Priority</option>
              <option value="dueDate">By Due Date</option>
            </select>
          </div>
          {(filterPriority !== 'all' || sortBy !== 'none') && (
            <button
              onClick={() => { setFilterPriority('all'); setSortBy('none'); }}
              className="text-sm text-red-500 hover:text-red-700"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((col) => {
            const colTasks = getFilteredTasks(col.id);
            return (
              <div key={col.id} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-700 dark:text-gray-300">
                    {col.label}
                    <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </h2>
                  <button
                    onClick={() => openCreateModal(col.id)}
                    className="text-blue-600 hover:text-blue-800 text-xl font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="space-y-3">
                  {colTasks.length === 0 && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                      No tasks here
                    </p>
                  )}
                  {colTasks.map((task) => (
                    <div
                      key={task._id}
                      className={`bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border ${
                        isOverdue(task.dueDate) && task.status !== 'done'
                          ? 'border-red-300 dark:border-red-500'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                        {task.title}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <p className={`text-xs mt-2 ${
                          isOverdue(task.dueDate) && task.status !== 'done'
                            ? 'text-red-500 font-medium'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue(task.dueDate) && task.status !== 'done' && ' — Overdue'}
                        </p>
                      )}
                      {task.estimatedEffort && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          ⏱ {task.estimatedEffort}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                        <button onClick={() => openEditModal(task)} className="text-xs text-blue-500 hover:text-blue-700">Edit</button>
                        <button onClick={() => handleDelete(task._id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                        {task.status !== 'todo' && (
                          <button
                            onClick={() => handleMoveTask(task, task.status === 'done' ? 'in-progress' : 'todo')}
                            className="text-xs text-gray-500 hover:text-gray-700 ml-auto"
                          >
                            ← Move Back
                          </button>
                        )}
                        {task.status !== 'done' && (
                          <button
                            onClick={() => handleMoveTask(task, task.status === 'todo' ? 'in-progress' : 'done')}
                            className="text-xs text-gray-500 hover:text-gray-700 ml-auto"
                          >
                            Move Forward →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editTask ? 'Edit Task' : 'Create Task'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Task title"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task description"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Effort</label>
                <input
                  type="text"
                  value={formData.estimatedEffort}
                  onChange={(e) => setFormData({ ...formData, estimatedEffort: e.target.value })}
                  placeholder="e.g. M (4-8 hours)"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* AI Suggest Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    ✨ AI Estimate
                  </span>
                  <button
                    type="button"
                    onClick={handleSuggestEstimate}
                    disabled={aiLoading}
                    className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition duration-200"
                  >
                    {aiLoading ? 'Thinking...' : 'Suggest Estimate'}
                  </button>
                </div>
                {aiSuggestion && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Effort:</span> {aiSuggestion.effort}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Due Date:</span> {aiSuggestion.suggestedDueDate}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                      {aiSuggestion.reasoning}
                    </p>
                    <button
                      type="button"
                      onClick={handleAcceptSuggestion}
                      className="mt-2 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition duration-200"
                    >
                      ✓ Accept Suggestion
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition duration-200"
                >
                  {saving ? 'Saving...' : editTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardView;