import { useState } from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'profile', label: '个人简介' },
    { id: 'skills', label: '技能展示' },
    { id: 'contact', label: '联系方式' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-blue-500">My Portfolio</h1>
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
