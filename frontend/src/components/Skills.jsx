import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState([]);

  useEffect(() => {
    api.getSkills().then(res => {
      setSkills(res.data);
      setForm(res.data);
    });
  }, []);

  const handleSave = async () => {
    await api.updateSkills(form);
    setSkills(form);
    setEditing(false);
  };

  const updateSkill = (index, field, value) => {
    const updated = [...form];
    updated[index] = { ...updated[index], [field]: value };
    setForm(updated);
  };

  const addSkill = () => {
    setForm([...form, { name: '', level: 50, category: '其他' }]);
  };

  const removeSkill = (index) => {
    setForm(form.filter((_, i) => i !== index));
  };

  const categories = [...new Set(skills.map(s => s.category))];

  return (
    <section className="py-12 px-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">技能展示</h2>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {editing ? '保存' : '编辑'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            {form.map((skill, index) => (
              <div key={index} className="flex gap-2 items-center bg-white p-3 rounded-lg shadow">
                <input
                  type="text"
                  value={skill.name}
                  onChange={e => updateSkill(index, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder="技能名称"
                />
                <input
                  type="number"
                  value={skill.level}
                  onChange={e => updateSkill(index, 'level', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border rounded"
                  min="0"
                  max="100"
                />
                <select
                  value={skill.category}
                  onChange={e => updateSkill(index, 'category', e.target.value)}
                  className="px-3 py-2 border rounded"
                >
                  <option>前端</option>
                  <option>后端</option>
                  <option>数据库</option>
                  <option>DevOps</option>
                  <option>其他</option>
                </select>
                <button
                  onClick={() => removeSkill(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            ))}
            <button
              onClick={addSkill}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500"
            >
              + 添加技能
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{category}</h3>
                <div className="space-y-3">
                  {skills.filter(s => s.category === category).map((skill, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-200">{skill.name}</span>
                        <span className="text-blue-500">{skill.level}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
