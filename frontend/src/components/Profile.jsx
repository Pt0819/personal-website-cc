import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.getProfile().then(res => {
      setProfile(res.data);
      setForm(res.data);
    });
  }, []);

  const handleSave = async () => {
    await api.updateProfile(form);
    setProfile(form);
    setEditing(false);
  };

  if (!profile) return <div className="text-center py-10">加载中...</div>;

  return (
    <section className="py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">个人简介</h2>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {editing ? '保存' : '编辑'}
          </button>
        </div>

        <div className="flex flex-col items-center">
          <img
            src={profile.avatar}
            alt="头像"
            className="w-32 h-32 rounded-full mb-6 border-4 border-blue-100"
          />

          {editing ? (
            <div className="w-full space-y-4">
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="姓名"
              />
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="职位"
              />
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg h-24"
                placeholder="个人简介"
              />
              <input
                type="text"
                value={form.avatar}
                onChange={e => setForm({ ...form, avatar: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="头像URL"
              />
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{profile.name}</h3>
              <p className="text-blue-500 font-medium mb-4">{profile.title}</p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
