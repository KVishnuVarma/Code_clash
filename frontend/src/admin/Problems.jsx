import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, Trash2, GripVertical, Filter, Plus, X, Moon, Sun } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const DIFFICULTY_COLORS = {
  Easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

// SortableTestCase Component
const SortableTestCase = ({ testCase, index, onChange, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: index });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 mb-4"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex-1 grid grid-cols-2 gap-4">
        <input
          type="text"
          value={testCase.input}
          onChange={(e) => onChange(index, 'input', e.target.value)}
          placeholder="Input"
          className="p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          value={testCase.output}
          onChange={(e) => onChange(index, 'output', e.target.value)}
          placeholder="Expected Output"
          className="p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
        />
      </div>
      <button
        onClick={() => onRemove(index)}
        className="p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

// ProblemCard Component
const ProblemCard = ({ problem, onEdit, onDelete, difficultyColor }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: problem._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2 dark:text-white">{problem.title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColor}`}>
            {problem.difficulty}
          </span>
        </div>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {problem.description}
      </p>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {problem.testCases.length} test cases
        </span>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ProblemModal Component
const ProblemModal = ({ isOpen, onClose, onSave, problem, draftKey }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    testCases: [{ input: '', output: '' }],
    languages: ['Python'],
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (problem) {
      setFormData(problem);
    } else {
      setFormData({
        title: '',
        description: '',
        difficulty: 'Easy',
        testCases: [{ input: '', output: '' }],
        languages: ['Python'],
      });
    }
  }, [problem]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isOpen && formData.title) {
        localStorage.setItem(draftKey, JSON.stringify(formData));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, formData, draftKey]);

  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...(formData.testCases || [])];
    updatedTestCases[index] = { ...updatedTestCases[index], [field]: value };
    setFormData({ ...formData, testCases: updatedTestCases });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFormData((prev) => ({
        ...prev,
        testCases: arrayMove(prev.testCases || [], active.id, over.id),
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold dark:text-white">
              {problem ? 'Edit Problem' : 'Add New Problem'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Problem Title"
              className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
            />

            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Problem Description"
              rows={4}
              className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
            />

            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <div>
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Test Cases</h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={(formData.testCases || []).map((_, i) => i)}
                  strategy={verticalListSortingStrategy}
                >
                  {formData.testCases?.map((testCase, index) => (
                    <SortableTestCase
                      key={index}
                      index={index}
                      testCase={testCase}
                      onChange={handleTestCaseChange}
                      onRemove={() => {
                        const updatedTestCases = formData.testCases?.filter((_, i) => i !== index);
                        setFormData({ ...formData, testCases: updatedTestCases });
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <button
                onClick={() => setFormData({
                  ...formData,
                  testCases: [...(formData.testCases || []), { input: '', output: '' }],
                })}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Test Case
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(formData)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Problem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Problems Component
export default function Problems() {
  const [darkMode, setDarkMode] = useState(false);
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [draftKey] = useState(() => 'problem-draft-' + Date.now());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchProblems();
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setEditingProblem(draft);
      setIsModalOpen(true);
    }
  }, []);

  useEffect(() => {
    if (selectedDifficulty === 'all') {
      setFilteredProblems(problems);
    } else {
      setFilteredProblems(problems.filter(p => p.difficulty === selectedDifficulty));
    }
  }, [selectedDifficulty, problems]);

  const fetchProblems = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/problems');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProblems(data);
        setFilteredProblems(data);
      }
    } catch (err) {
      toast.error('Failed to fetch problems');
      console.error(err);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setProblems((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/problems/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setProblems(prev => prev.filter(p => p._id !== id));
        toast.success('Problem deleted successfully');
      } else {
        toast.error('Failed to delete problem');
      }
    } catch (error) {
      toast.error('Error deleting problem');
      console.error(error);
    }
  };

  const handleSave = async (problemData) => {
    const isEditing = !!editingProblem;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing 
      ? `http://localhost:5000/api/problems/${editingProblem._id}`
      : 'http://localhost:5000/api/problems/add';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problemData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isEditing) {
          setProblems(prev => prev.map(p => 
            p._id === editingProblem._id ? data.problem : p
          ));
        } else {
          setProblems(prev => [...prev, data.problem]);
        }
        
        setIsModalOpen(false);
        setEditingProblem(null);
        localStorage.removeItem(draftKey);
        toast.success(`Problem ${isEditing ? 'updated' : 'added'} successfully`);
      } else {
        toast.error(data.error || 'Failed to save problem');
      }
    } catch (error) {
      toast.error('Error saving problem');
      console.error(error);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-22 right-8 p-2 rounded-full bg-opacity-20 backdrop-blur-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        {darkMode ? (
          <Sun className="w-6 h-6 text-yellow-400" />
        ) : (
          <Moon className="w-6 h-6 text-gray-600" />
        )}
      </button>

      <div className="container mx-auto px-8 py-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold dark:text-white">Problem Management</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Problem
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <div className="flex gap-2">
            {['all', 'Easy', 'Medium', 'Hard'].map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDifficulty === difficulty
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SortableContext 
              items={filteredProblems.map(p => p._id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredProblems.map((problem) => (
                <ProblemCard
                  key={problem._id}
                  problem={problem}
                  onEdit={() => handleEdit(problem)}
                  onDelete={() => handleDelete(problem._id)}
                  difficultyColor={DIFFICULTY_COLORS[problem.difficulty]}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>

        <ProblemModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProblem(null);
            localStorage.removeItem(draftKey);
          }}
          onSave={handleSave}
          problem={editingProblem}
          draftKey={draftKey}
        />
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}