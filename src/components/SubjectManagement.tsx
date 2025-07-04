import React, { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { Subject, User } from '../types';

interface SubjectManagementProps {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  onUpdateSubject: (id: string, subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  onDeleteSubject: (id: string) => void;
  currentUser?: User;
}

const SubjectManagement: React.FC<SubjectManagementProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  currentUser
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 3,
    semester: 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSubject) {
      onUpdateSubject(editingSubject.id, formData);
      setEditingSubject(null);
    } else {
      onAddSubject(formData);
    }
    
    setFormData({
      name: '',
      code: '',
      credits: 3,
      semester: 1
    });
    setShowForm(false);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      semester: subject.semester
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      credits: 3,
      semester: 1
    });
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Subject Management</h2>
            <p className="text-gray-600 text-sm sm:text-base">Manage course subjects and their details</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Add Subject</span>
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && isAdmin && (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., Data Structures and Algorithms"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., CS-201"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Hours *
                </label>
                <select
                  required
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                >
                  {[1, 2, 3, 4, 5, 6].map(credit => (
                    <option key={credit} value={credit}>{credit} Credit{credit > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester *
                </label>
                <select
                  required
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                >
                  {editingSubject ? 'Update Subject' : 'Add Subject'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subjects List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Course Subjects ({subjects.length})
            </h3>
          </div>
          
          {subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
              {subjects.map((subject) => (
                <div key={subject.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {subject.name}
                        </h4>
                        <p className="text-sm text-gray-500">{subject.code}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex space-x-1 flex-shrink-0 ml-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteSubject(subject.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <span>{subject.credits} Credit{subject.credits > 1 ? 's' : ''}</span>
                    <span>Semester {subject.semester}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects added</h3>
              <p className="mt-1 text-sm text-gray-500">
                {isAdmin ? 'Get started by adding your first subject.' : 'No subjects available yet.'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Add First Subject
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectManagement;