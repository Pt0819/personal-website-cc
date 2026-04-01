import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Contact() {
  const [contact, setContact] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.getContacts().then(res => {
      setContact(res.data);
      setForm(res.data);
    });
  }, []);

  const handleSave = async () => {
    await api.updateContacts(form);
    setContact(form);
    setEditing(false);
  };

  if (!contact) return <div className="text-center py-10">加载中...</div>;

  const socialLinks = [
    { key: 'email', label: '邮箱', icon: '📧', prefix: 'mailto:' },
    { key: 'github', label: 'GitHub', icon: '🐙', prefix: '' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼', prefix: '' },
    { key: 'twitter', label: 'Twitter', icon: '🐦', prefix: '' },
  ];

  return (
    <section className="py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">联系方式</h2>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {editing ? '保存' : '编辑'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            {socialLinks.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={form[key] || ''}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder={`输入${label}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {socialLinks.map(({ key, label, icon, prefix }) => (
              contact[key] && (
                <a
                  key={key}
                  href={`${prefix}${contact[key]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition group"
                >
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-500 truncate">
                      {contact[key].replace(/^https?:\/\//, '').replace(/^mailto:/, '')}
                    </p>
                  </div>
                </a>
              )
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
