import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getBoards, createBoard, deleteBoard } from '../api/boards';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBoard, setNewBoard] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await getBoards();
      setBoards(res.data);
    } catch (err) {
      setError('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await createBoard(newBoard);
      setBoards([res.data, ...boards]);
      setNewBoard({ title: '', description: '' });
      setShowModal(false);
    } catch (err) {
      setError('Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBoard = async (id) => {
    if (!window.confirm('Are you sure you want to delete this board?')) return;
    try {
      await deleteBoard(id);
      setBoards(boards.filter((b) => b._id !== id));
    } catch (err) {
      setError('Failed to delete board');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Boards</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
          >
            + New Board
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : boards.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📋</p>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No boards yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">Create your first board to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition duration-200"
            >
              Create Board
            </button>
          </div>
        ) : (
          /* Board cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition duration-200"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/board/${board._id}`)}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {board.title}
                  </h3>
                  {board.description && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                      {board.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Created {new Date(board.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <button
                    onClick={() => handleDeleteBoard(board._id)}
                    className="text-sm text-red-500 hover:text-red-700 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Board
            </h2>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Board Title
                </label>
                <input
                  type="text"
                  value={newBoard.title}
                  onChange={(e) => setNewBoard({ ...newBoard, title: e.target.value })}
                  placeholder="e.g. Marketing Campaign"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newBoard.description}
                  onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                  placeholder="What is this board for?"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
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
                  disabled={creating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition duration-200"
                >
                  {creating ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;