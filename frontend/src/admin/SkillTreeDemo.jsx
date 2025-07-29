import React, { useState } from "react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import SkillTree from "../Components/SkillTree"
import { useTheme } from "../context/ThemeContext"

const SkillTreeDemo = () => {
  const [selectedSkills, setSelectedSkills] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "medium",
    timeLimit: 30
  })
  const { getThemeColors } = useTheme()
  const themeColors = getThemeColors()

  const handleSkillsChange = (newSkills) => {
    setSelectedSkills(newSkills)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted with:", {
      ...formData,
      skills: selectedSkills
    })
    // Here you would typically send the data to your backend
    alert(`Problem created with ${selectedSkills.length} skills selected!`)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className={`min-h-screen ${themeColors.bg} p-6`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${themeColors.text} mb-2`}>
            Skill Tree Component Demo
          </h1>
          <p className={`${themeColors.textSecondary} text-lg`}>
            Admin panel integration for problem creation with skill tree selection
          </p>
        </div>

        {/* Demo Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${themeColors.accentBg} rounded-xl border ${themeColors.border} p-6 shadow-lg`}
        >
          <h2 className={`text-2xl font-semibold ${themeColors.text} mb-6`}>
            Create New Problem
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Problem Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                  Problem Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${themeColors.border} ${themeColors.bg} ${themeColors.text} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter problem title..."
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${themeColors.border} ${themeColors.bg} ${themeColors.text} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                Problem Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border ${themeColors.border} ${themeColors.bg} ${themeColors.text} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter problem description..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleInputChange}
                  min="1"
                  max="300"
                  className={`w-full px-4 py-2 rounded-lg border ${themeColors.border} ${themeColors.bg} ${themeColors.text} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                  Required Skills
                </label>
                <SkillTree
                  selectedSkills={selectedSkills}
                  onSkillsChange={handleSkillsChange}
                  className="w-full"
                />
              </div>
            </div>

            {/* Selected Skills Summary */}
            {selectedSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`p-4 rounded-lg ${themeColors.accentBg} border ${themeColors.border}`}
              >
                <h3 className={`text-sm font-medium ${themeColors.text} mb-2`}>
                  Selected Skills ({selectedSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill, index) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Create Problem
            </motion.button>
          </form>
        </motion.div>

        {/* Usage Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mt-8 ${themeColors.accentBg} rounded-xl border ${themeColors.border} p-6`}
        >
          <h3 className={`text-xl font-semibold ${themeColors.text} mb-4`}>
            How to Use the Skill Tree Component
          </h3>
          <div className={`space-y-3 ${themeColors.textSecondary} text-sm`}>
            <p>• Click on the "Select skills from skill tree..." button to open the skill selector</p>
            <p>• Use the search bar to filter skills by name or category</p>
            <p>• Click on any skill to select/deselect it</p>
            <p>• Selected skills will appear as tags below the component</p>
            <p>• Click the × button on any tag to remove that skill</p>
            <p>• The component supports both light and dark themes</p>
          </div>
        </motion.div>

        {/* Component Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mt-6 ${themeColors.accentBg} rounded-xl border ${themeColors.border} p-6`}
        >
          <h3 className={`text-xl font-semibold ${themeColors.text} mb-4`}>
            Component Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${themeColors.textSecondary} text-sm space-y-2`}>
              <p>✅ Categorized skill organization</p>
              <p>✅ Search functionality</p>
              <p>✅ Multi-select capability</p>
              <p>✅ Visual feedback with checkmarks</p>
            </div>
            <div className={`${themeColors.textSecondary} text-sm space-y-2`}>
              <p>✅ Dark/light theme support</p>
              <p>✅ Responsive design</p>
              <p>✅ Keyboard navigation</p>
              <p>✅ Accessible UI components</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default SkillTreeDemo