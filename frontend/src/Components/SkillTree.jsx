import React, { useState, useRef, useEffect } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"

// Skill categories with their respective skills
const skillCategories = [
  {
    category: "Data Structures",
    skills: [
      { value: "array", label: "Array" },
      { value: "string", label: "String" },
      { value: "hash-table", label: "Hash Table" },
      { value: "linked-list", label: "Linked List" },
      { value: "stack", label: "Stack" },
      { value: "queue", label: "Queue" },
      { value: "tree", label: "Tree" },
      { value: "binary-tree", label: "Binary Tree" },
      { value: "binary-search-tree", label: "Binary Search Tree" },
      { value: "graph", label: "Graph" },
      { value: "heap", label: "Heap (Priority Queue)" },
      { value: "trie", label: "Trie" },
      { value: "segment-tree", label: "Segment Tree" },
      { value: "binary-indexed-tree", label: "Binary Indexed Tree" },
    ]
  },
  {
    category: "Algorithms",
    skills: [
      { value: "sorting", label: "Sorting" },
      { value: "binary-search", label: "Binary Search" },
      { value: "depth-first-search", label: "Depth-First Search" },
      { value: "breadth-first-search", label: "Breadth-First Search" },
      { value: "dynamic-programming", label: "Dynamic Programming" },
      { value: "greedy", label: "Greedy" },
      { value: "backtracking", label: "Backtracking" },
      { value: "two-pointers", label: "Two Pointers" },
      { value: "sliding-window", label: "Sliding Window" },
      { value: "prefix-sum", label: "Prefix Sum" },
      { value: "bit-manipulation", label: "Bit Manipulation" },
      { value: "recursion", label: "Recursion" },
      { value: "divide-and-conquer", label: "Divide and Conquer" },
      { value: "memoization", label: "Memoization" },
    ]
  },
  {
    category: "Advanced Topics",
    skills: [
      { value: "math", label: "Math" },
      { value: "number-theory", label: "Number Theory" },
      { value: "combinatorics", label: "Combinatorics" },
      { value: "geometry", label: "Geometry" },
      { value: "game-theory", label: "Game Theory" },
      { value: "probability-statistics", label: "Probability and Statistics" },
      { value: "string-matching", label: "String Matching" },
      { value: "topological-sort", label: "Topological Sort" },
      { value: "shortest-path", label: "Shortest Path" },
      { value: "minimum-spanning-tree", label: "Minimum Spanning Tree" },
      { value: "strongly-connected-component", label: "Strongly Connected Component" },
      { value: "eulerian-circuit", label: "Eulerian Circuit" },
      { value: "biconnected-component", label: "Biconnected Component" },
    ]
  },
  {
    category: "Problem Solving",
    skills: [
      { value: "simulation", label: "Simulation" },
      { value: "counting", label: "Counting" },
      { value: "enumeration", label: "Enumeration" },
      { value: "design", label: "Design" },
      { value: "interactive", label: "Interactive" },
      { value: "data-stream", label: "Data Stream" },
      { value: "brainteaser", label: "Brainteaser" },
      { value: "randomized", label: "Randomized" },
      { value: "rejection-sampling", label: "Rejection Sampling" },
      { value: "reservoir-sampling", label: "Reservoir Sampling" },
      { value: "line-sweep", label: "Line Sweep" },
      { value: "rolling-hash", label: "Rolling Hash" },
      { value: "suffix-array", label: "Suffix Array" },
    ]
  },
  {
    category: "Database & System",
    skills: [
      { value: "database", label: "Database" },
      { value: "concurrency", label: "Concurrency" },
      { value: "iterator", label: "Iterator" },
      { value: "monotonic-stack", label: "Monotonic Stack" },
      { value: "monotonic-queue", label: "Monotonic Queue" },
      { value: "ordered-set", label: "Ordered Set" },
      { value: "bitmask", label: "Bitmask" },
      { value: "union-find", label: "Union Find" },
      { value: "doubly-linked-list", label: "Doubly-Linked List" },
    ]
  }
]

export function SkillTree({ selectedSkills = [], onSkillsChange, className }) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const dropdownRef = useRef(null)

  // Flatten all skills for search
  const allSkills = skillCategories.flatMap(category => 
    category.skills.map(skill => ({
      ...skill,
      category: category.category
    }))
  )

  // Filter skills based on search
  const filteredSkills = allSkills.filter(skill =>
    skill.label.toLowerCase().includes(searchValue.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Group filtered skills by category
  const groupedFilteredSkills = skillCategories.map(category => ({
    ...category,
    skills: category.skills.filter(skill =>
      skill.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      category.category.toLowerCase().includes(searchValue.toLowerCase())
    )
  })).filter(category => category.skills.length > 0)

  const handleSkillToggle = (skillValue) => {
    const newSelectedSkills = selectedSkills.includes(skillValue)
      ? selectedSkills.filter(skill => skill !== skillValue)
      : [...selectedSkills, skillValue]
    
    onSkillsChange(newSelectedSkills)
  }

  const getSelectedSkillLabels = () => {
    return selectedSkills.map(value => 
      allSkills.find(skill => skill.value === value)?.label
    ).filter(Boolean)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn("w-full relative", className)} ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className="w-full justify-between bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        {selectedSkills.length > 0 ? (
          <span className="truncate">
            {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
          </span>
        ) : (
          "Select skills from skill tree..."
        )}
        <ChevronsUpDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")} />
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search skills..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Skills List */}
          <div className="max-h-64 overflow-y-auto">
            {groupedFilteredSkills.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No skills found.
              </div>
            ) : (
              groupedFilteredSkills.map((category) => (
                <div key={category.category} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {category.category}
                  </div>
                  {category.skills.map((skill) => (
                    <div
                      key={skill.value}
                      onClick={() => handleSkillToggle(skill.value)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <span className="text-sm text-gray-900 dark:text-white">{skill.label}</span>
                      <Check
                        className={cn(
                          "h-4 w-4 text-blue-600 dark:text-blue-400",
                          selectedSkills.includes(skill.value) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Selected Skills Display */}
      {selectedSkills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {getSelectedSkillLabels().map((label, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {label}
              <button
                onClick={() => handleSkillToggle(selectedSkills[index])}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 dark:hover:bg-blue-800 dark:hover:text-blue-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default SkillTree