import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [originalData, setOriginalData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      const initialData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [user]);

  const handleInputChange = (e) => {
    if (!isEditing) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) return;

    setLoading(true);
    const result = await updateProfile(formData);
    setLoading(false);
    
    if (result.success) {
      setOriginalData(formData);
      setIsEditing(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-dark rounded-xl p-8 w-full max-w-2xl"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-textSecondary mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`input-field ${!isEditing ? 'opacity-75 cursor-not-allowed' : ''}`}
              required
            />
          </div>

          <div>
            <label className="block text-textSecondary mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="input-field opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-textMuted mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-textSecondary mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`input-field ${!isEditing ? 'opacity-75 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-textSecondary mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`input-field ${!isEditing ? 'opacity-75 cursor-not-allowed' : ''}`}
              rows="4"
            />
          </div>

          <div>
            <label className="block text-textSecondary mb-2">Role</label>
            <input
              type="text"
              value={user.role === 'admin' ? 'Administrator' : 'Customer'}
              disabled
              className="input-field opacity-50 cursor-not-allowed"
            />
          </div>

          <div className="flex gap-4">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleEdit}
                className="btn-primary flex-1"
              >
                Update Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
