"use client";

import { bulkDeleteTasks, bulkToggleTaskCompletion } from "@/services/api";
import { useToast } from './ToastProvider'; // Corrected import path
import { motion } from "framer-motion";

interface BulkActionsProps {
  selectedTaskIds: string[];
  refreshTasks: () => void;
  clearSelection: () => void;
}

export default function BulkActions({
  selectedTaskIds,
  refreshTasks,
  clearSelection,
}: BulkActionsProps) {
    const { addToast } = useToast(); // Initialize useToast

    const handleBulkDelete = async () => {
      if (selectedTaskIds.length === 0) return;
      if (confirm(`Are you sure you want to delete ${selectedTaskIds.length} selected tasks?`)) {
          try {
              await bulkDeleteTasks(selectedTaskIds);
              addToast(`${selectedTaskIds.length} tasks deleted successfully!`, "success");
              refreshTasks();
              clearSelection();
          } catch (error: any) {
              addToast(`Error deleting tasks: ${error.message}`, "error");
          }
      }
    };

    const handleBulkMarkComplete = async () => {
      if (selectedTaskIds.length === 0) return;
      try {
          await bulkToggleTaskCompletion(selectedTaskIds, 'completed');
          addToast(`${selectedTaskIds.length} tasks marked completed!`, "success");
          refreshTasks();
          clearSelection();
      } catch (error: any) {
          addToast(`Error marking tasks complete: ${error.message}`, "error");
      }
    };

    const handleBulkMarkPending = async () => {
      if (selectedTaskIds.length === 0) return;
      try {
          await bulkToggleTaskCompletion(selectedTaskIds, 'pending');
          addToast(`${selectedTaskIds.length} tasks marked pending!`, "success");
          refreshTasks();
          clearSelection();
      } catch (error: any) {
          addToast(`Error marking tasks pending: ${error.message}`, "error");
      }
    };

    const isDisabled = selectedTaskIds.length === 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-3 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg"
      >
        <div className="flex-grow min-w-[200px]">
          <p className="text-sm text-gray-400 mb-2">
            {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBulkDelete}
            disabled={isDisabled}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-300
              ${isDisabled
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg hover:shadow-red-500/20'
              }
            `}
          >
            Delete Selected
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBulkMarkComplete}
            disabled={isDisabled}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-300
              ${isDisabled
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg hover:shadow-indigo-500/20'
              }
            `}
          >
            Mark Complete
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBulkMarkPending}
            disabled={isDisabled}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-300
              ${isDisabled
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white shadow-lg hover:shadow-gray-500/20'
              }
            `}
          >
            Mark Pending
          </motion.button>
        </div>
      </motion.div>
    );
}