import React, { useState, useRef, useEffect } from "react"
import { ChevronsUpDown, Search } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"

// Topics list for the combobox
const topics = [
  "Array",
  "Math", 
  "Binary Search",
  "Breadth-First Search",
  "Heap (Priority Queue)",
  "Stack",
  "Enumeration",
  "String",
  "Sorting",
  "Database",
  "Bit Manipulation",
  "Simulation",
  "Counting",
  "Backtracking",
  "Hash Table",
  "Greedy",
  "Matrix",
  "Two Pointers",
  "Binary Tree",
  "Sliding Window",
  "Union Find",
  "Dynamic Programming",
  "Depth-First Search",
  "Tree",
  "Prefix Sum",
  "Graph",
  "Design",
  "Linked List"
]

export function SkillTree({ selectedTopic = "", onTopicChange, className }) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const dropdownRef = useRef(null)

  // Filter topics based on search
  const filteredTopics = topics.filter(topic =>
    topic.toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleTopicSelect = (topic) => {
    onTopicChange(topic)
    setOpen(false)
    setSearchValue("")
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
        setSearchValue("")
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
        className="w-full justify-between bg-gray-800 dark:bg-gray-800 border-gray-600 dark:border-gray-600 text-gray-300 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700"
      >
        {selectedTopic || "Select framework..."}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 dark:bg-gray-800 border border-gray-600 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-700 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search framework..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-800 dark:bg-gray-800 text-gray-300 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none border-none"
                autoFocus
              />
            </div>
          </div>

          {/* Topics List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredTopics.length === 0 ? (
              <div className="p-4 text-center text-gray-400 dark:text-gray-400">
                No frameworks found.
              </div>
            ) : (
              filteredTopics.map((topic) => (
                <div
                  key={topic}
                  onClick={() => handleTopicSelect(topic)}
                  className="px-3 py-2 text-gray-300 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {topic}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SkillTree