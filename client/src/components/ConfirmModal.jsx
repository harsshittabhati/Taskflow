const ConfirmModal = ({ message, subMessage = 'This action cannot be undone.', onConfirm, onCancel, confirmLabel = 'Delete' }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 z-[100]"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 dark:border-gray-700">
        
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <span className="text-2xl">🗑️</span>
          </div>
        </div>

        <p className="text-gray-800 dark:text-white text-base font-medium text-center mb-2">
          {message}
        </p>
        {subMessage && (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
            {subMessage}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 cursor-pointer font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition duration-200 cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;