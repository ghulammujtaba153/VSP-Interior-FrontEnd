"use client";

import CustomTaskListTableRow from "./CustomTaskListTableRow";

/**
 * CustomTaskListTable Component
 * 
 * Displays a table of tasks for the Gantt chart.
 * Includes a header row and renders task rows using CustomTaskListTableRow.
 * 
 * @param {Array} tasks - Array of task objects to display
 * @param {Function} onTaskClick - Callback when a task is clicked
 * @param {Function} onEditTask - Callback when edit button is clicked
 * @param {Function} onDeleteTask - Callback when delete button is clicked
 */
const CustomTaskListTable = ({ 
  tasks, 
  onTaskClick, 
  onEditTask, 
  onDeleteTask 
}) => {
  return (
    <div className="border-r bg-white">
      {/* Header */}
      <div className="flex items-center border-b font-semibold bg-gray-50" style={{ height: '44px' }}>
        <div className="flex-1 min-w-0 px-2 py-1 border-r">Task Name</div>
        <div className="w-40 px-2 py-1 border-r">Assigned To</div>
        <div className="w-32 px-2 py-1 border-r">Start Date</div>
        <div className="w-32 px-2 py-1 border-r">End Date</div>
      </div>
      
      {/* Task Rows */}
      {tasks.map((task) => (
        <CustomTaskListTableRow
          key={task.id}
          task={task}
          onTaskClick={onTaskClick}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
};

export default CustomTaskListTable;

