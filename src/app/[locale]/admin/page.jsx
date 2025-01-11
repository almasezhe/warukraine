'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// -------------------------------------
// 1) Модалки (не меняем)
// -------------------------------------
export const AddLotModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    current_bid: 0,
    min_raise: 10,
    date_of_finishing: '',
    time_of_finishing: '',
    image_url: '',
  });
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = formData.image_url;

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('auction_images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload image. Please try again.');
        return;
      }

      const { data: publicUrlData, error: publicUrlError } = supabase
        .storage
        .from('auction_images')
        .getPublicUrl(fileName);

      if (publicUrlError) {
        console.error('Error retrieving public URL:', publicUrlError);
        toast.error('Failed to retrieve image URL. Please try again.');
        return;
      }

      imageUrl = publicUrlData.publicUrl;
    }

    onSave({ ...formData, image_url: imageUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add Lot</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="lotName">
              Lot Name
            </label>
            <input
              id="lotName"
              type="text"
              name="name"
              placeholder="e.g. Rare Artifact"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="lotDesc">
              Description
            </label>
            <textarea
              id="lotDesc"
              name="description"
              placeholder="Short description of the lot"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="currentBid">
              Current Bid
            </label>
            <input
              id="currentBid"
              type="number"
              name="current_bid"
              placeholder="e.g. 50"
              value={formData.current_bid}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="minRaise">
              Minimum Raise
            </label>
            <input
              id="minRaise"
              type="number"
              name="min_raise"
              placeholder="e.g. 10"
              value={formData.min_raise}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="finishingDate">
              Finishing Date
            </label>
            <input
              id="finishingDate"
              type="date"
              name="date_of_finishing"
              value={formData.date_of_finishing}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="finishingTime">
              Finishing Time
            </label>
            <input
              id="finishingTime"
              type="time"
              name="time_of_finishing"
              value={formData.time_of_finishing}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Image (optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-md"
          >
            Add Lot
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 p-2 rounded-md mt-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

// ===================== EditLotModal =====================
export const EditLotModal = ({ lot, onSave, onClose }) => {
  const [formData, setFormData] = useState(lot);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (lot) setFormData(lot);
  }, [lot]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = formData.image_url;

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('auction_images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload image. Please try again.');
        return;
      }

      const { data: publicUrlData, error: publicUrlError } = supabase
        .storage
        .from('auction_images')
        .getPublicUrl(fileName);

      if (publicUrlError) {
        console.error('Error retrieving public URL:', publicUrlError);
        toast.error('Failed to retrieve image URL. Please try again.');
        return;
      }

      imageUrl = publicUrlData.publicUrl;
    }

    onSave({ ...formData, image_url: imageUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Lot</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="lotName">
              Lot Name
            </label>
            <input
              id="lotName"
              type="text"
              name="name"
              placeholder="e.g. Rare Artifact"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="lotDesc">
              Description
            </label>
            <textarea
              id="lotDesc"
              name="description"
              placeholder="Short description of the lot"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="currentBid">
              Current Bid
            </label>
            <input
              id="currentBid"
              type="number"
              name="current_bid"
              placeholder="e.g. 50"
              value={formData.current_bid || 0}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="minRaise">
              Minimum Raise
            </label>
            <input
              id="minRaise"
              type="number"
              name="min_raise"
              placeholder="e.g. 10"
              value={formData.min_raise || 0}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="finishingDate">
              Finishing Date
            </label>
            <input
              id="finishingDate"
              type="date"
              name="date_of_finishing"
              value={formData.date_of_finishing || ''}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="finishingTime">
              Finishing Time
            </label>
            <input
              id="finishingTime"
              type="time"
              name="time_of_finishing"
              value={formData.time_of_finishing || ''}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Update Image (optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-md"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 p-2 rounded-md mt-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

// ===================== EditOptionModal =====================
export const EditOptionModal = ({ option, onSave, onClose }) => {
  const [formData, setFormData] = useState(option);

  useEffect(() => {
    if (option) setFormData(option);
  }, [option]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Option</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="optionName">
              Option Name
            </label>
            <input
              id="optionName"
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="e.g. Premium Package"
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="optionCost">
              Cost
            </label>
            <input
              id="optionCost"
              type="number"
              name="cost"
              value={formData.cost || 0}
              onChange={handleChange}
              placeholder="e.g. 100"
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="optionDesc">
              Description
            </label>
            <textarea
              id="optionDesc"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Description of the option"
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-md"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 p-2 rounded-md mt-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

// ===================== AddOptionModal =====================
export const AddOptionModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    cost: 0,
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add Option</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="optionName">
              Option Name
            </label>
            <input
              id="optionName"
              type="text"
              name="name"
              onChange={handleChange}
              placeholder="e.g. Premium Package"
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="optionCost">
              Cost
            </label>
            <input
              id="optionCost"
              type="number"
              name="cost"
              onChange={handleChange}
              placeholder="e.g. 50"
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="optionDesc">
              Description
            </label>
            <textarea
              id="optionDesc"
              name="description"
              onChange={handleChange}
              placeholder="Describe what this option includes"
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-md"
          >
            Add Option
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 p-2 rounded-md mt-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};
// -------------------------------------
// 2) Основной компонент AdminPanel
// -------------------------------------
export default function AdminPanel() {
  const [lots, setLots] = useState([]);
  const [lotHistories, setLotHistories] = useState({}); 
  const [options, setOptions] = useState([]);
  const [optionMessages, setOptionMessages] = useState({});
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState({ type: '', data: null });
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState('lots');

  // ======== Fetch ========
  const fetchLots = async () => {
    const { data, error } = await supabase.from('auction_items').select('*');
    if (error) toast.error('Error fetching lots.');
    else setLots(data);
  };

  const fetchLotHistory = async (lotId) => {
    try {
      const { data, error } = await supabase
        .from('bid_history')
        .select('*')
        .eq('auction_item_id', lotId);
      if (error) {
        toast.error('Error fetching bid history.');
        return [];
      }
      return data;
    } catch (err) {
      console.error('Unexpected error fetching bid history:', err);
      return [];
    }
  };

  const fetchOptions = async () => {
    const { data, error } = await supabase.from('options').select('*');
    if (error) toast.error('Error fetching options.');
    else setOptions(data);
  };

  const fetchOptionMessages = async (optionId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('option_id', optionId);
      if (error) {
        toast.error('Error fetching messages.');
        return [];
      }
      return data;
    } catch (err) {
      console.error('Unexpected error fetching messages:', err);
      return [];
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        is_banned,
        admins (id)
      `);

    if (error) {
      toast.error('Error fetching users.');
      console.error('Fetch users error:', error);
      return;
    }
    // Возвращаем «прежний» вид — Admin / Ban
    const enrichedUsers = data.map((user) => ({
      ...user,
      is_admin: user.admins.length > 0,
    }));
    setUsers(enrichedUsers);
  };

  // ======== CRUD ========
  const handleAddLot = async (newData) => {
    try {
      if (!newData.name || !newData.date_of_finishing || !newData.time_of_finishing) {
        toast.error('Please fill in all required fields: Name, Date, and Time.');
        return;
      }
      if (newData.current_bid < 0 || newData.min_raise < 0) {
        toast.error('Bid values must be positive.');
        return;
      }
      const { error } = await supabase.from('auction_items').insert(newData);
      if (error) {
        toast.error(`Error adding lot: ${error.message}`);
        console.error('Supabase error:', error);
      } else {
        fetchLots();
        toast.success('Lot added successfully.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleEditLot = async (updatedData) => {
    try {
      if (!updatedData.name || !updatedData.date_of_finishing || !updatedData.time_of_finishing) {
        toast.error('Please fill in all required fields: Name, Date, and Time.');
        return;
      }
      if (updatedData.current_bid < 0 || updatedData.min_raise < 0) {
        toast.error('Bid values must be positive.');
        return;
      }
      const { error } = await supabase
        .from('auction_items')
        .update({
          name: updatedData.name,
          description: updatedData.description,
          current_bid: updatedData.current_bid,
          min_raise: updatedData.min_raise,
          date_of_finishing: updatedData.date_of_finishing,
          time_of_finishing: updatedData.time_of_finishing,
          image_url: updatedData.image_url,
        })
        .eq('id', updatedData.id);
      if (error) {
        toast.error(`Error editing lot: ${error.message}`);
        console.error('Supabase error:', error);
      } else {
        fetchLots();
        setModal({ type: '', data: null });
        toast.success('Lot updated successfully.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleDeleteLot = async (lotId) => {
    const { error } = await supabase.from('auction_items').delete().eq('id', lotId);
    if (error) {
      toast.error('Error deleting lot.');
    } else {
      toast.success('Lot deleted successfully.');
      fetchLots();
    }
  };

  const handleAddOption = async (newData) => {
    const { error } = await supabase.from('options').insert(newData);
    if (error) {
      toast.error('Error adding option.');
      console.error(error);
    } else {
      fetchOptions();
      toast.success('Option added successfully.');
    }
  };

  const handleEditOption = async (updatedData) => {
    const { error } = await supabase
      .from('options')
      .update({
        name: updatedData.name,
        cost: updatedData.cost,
        description: updatedData.description,
      })
      .eq('id', updatedData.id);
    if (error) {
      toast.error('Error editing option.');
    } else {
      fetchOptions();
      setModal({ type: '', data: null });
      toast.success('Option updated successfully.');
    }
  };

  const handleDeleteOption = async (optionId) => {
    const { error } = await supabase.from('options').delete().eq('id', optionId);
    if (error) {
      toast.error('Error deleting option.');
      console.log(error);
    } else {
      toast.success('Option deleted successfully.');
      fetchOptions();
    }
  };

  // Бан / Разбан
  const handleBanUser = async (userId, isBanned) => {
    const { error } = await supabase
      .from('users')
      .update({ is_banned: isBanned })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update user ban status.');
    } else {
      toast.success(
        isBanned ? 'User banned successfully.' : 'User unbanned successfully.'
      );
      fetchUsers();
    }
  };

  // Promote / Demote
  const handlePromoteUser = async (userId) => {
    const { error } = await supabase.from('admins').insert({ user_id: userId });
    if (error) {
      toast.error('Failed to promote user.');
    } else {
      toast.success('User promoted to admin successfully.');
      fetchUsers();
    }
  };

  const handleDemoteUser = async (userId) => {
    const { error } = await supabase.from('admins').delete().eq('user_id', userId);
    if (error) {
      toast.error('Failed to demote user.');
    } else {
      toast.success('User demoted successfully.');
      fetchUsers();
    }
  };

  // ========  View History & Messages ========
  const handleViewHistory = async (lotId) => {
    if (lotHistories[lotId]) {
      // toggle
      setLotHistories((prev) => {
        const copy = { ...prev };
        delete copy[lotId];
        return copy;
      });
    } else {
      const bids = await fetchLotHistory(lotId);
      setLotHistories((prev) => ({ ...prev, [lotId]: bids }));
    }
  };

  const handleViewMessages = async (optionId) => {
    if (optionMessages[optionId]) {
      // toggle
      setOptionMessages((prev) => {
        const copy = { ...prev };
        delete copy[optionId];
        return copy;
      });
    } else {
      const msgs = await fetchOptionMessages(optionId);
      setOptionMessages((prev) => ({ ...prev, [optionId]: msgs }));
    }
  };

  // Проверяем, админ ли
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        toast.error('Unable to verify admin status.');
        return;
      }
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setIsAdmin(!!adminData);
    };

    checkAdmin();
    fetchLots();
    fetchOptions();
    fetchUsers();
  }, []);

  if (!isAdmin) {
    return <p className="text-red-500 text-center mt-10">Access denied. Admin only.</p>;
  }

  // =============== ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ===============

  const Section = ({ children }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">{children}</div>
  );

  const Item = ({ title, subtitle, children, onClick, onDelete }) => (
    <div
      className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-400">{subtitle}</p>
      <div className="mt-2 flex justify-between items-center">
        {children && <div>{children}</div>}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 bg-red-600 rounded-md hover:bg-red-700 text-sm"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );

  // =============== LOTS ===============
  const renderLotsTab = () => (
    <Section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Lots</h2>
        <button
          onClick={() => setModal({ type: 'add-lot', data: null })}
          className="p-2 bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add Lot
        </button>
      </div>

      {/* Карточки лотов (5 штук на ряд на больших экранах) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {lots.map((lot) => {
          const showHistory = !!lotHistories[lot.id];
          return (
            <Item
              key={lot.id}
              title={lot.name}
              subtitle={`Current Bid: $${lot.current_bid}`}
              onClick={() => setModal({ type: 'edit-lot', data: lot })}
              onDelete={() => handleDeleteLot(lot.id)}
            >
              {lot.image_url && (
                <img
                  src={lot.image_url}
                  alt={lot.name}
                  className="w-full h-32 object-cover rounded-md mt-2"
                />
              )}

              <div className="flex items-center space-x-2 mt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewHistory(lot.id);
                  }}
                  className="p-1 bg-yellow-600 hover:bg-yellow-500 rounded text-sm"
                >
                  {showHistory ? 'Hide History' : 'View History'}
                </button>
              </div>

              {showHistory && (
                <div className="mt-3 bg-gray-600 p-2 rounded">
                  <p className="font-semibold">Bid History:</p>
                  {lotHistories[lot.id] && lotHistories[lot.id].length > 0 ? (
                    <ul className="mt-2 space-y-2">
                      {lotHistories[lot.id].map((bid) => (
                        <li key={bid.id} className="bg-gray-700 p-2 rounded">
                          <p>
                            <strong>User ID:</strong> {bid.user_id}
                          </p>
                          <p>
                            <strong>Bid Amount:</strong> ${bid.bid_amount}
                          </p>
                          <p>
                            <strong>Bid Time:</strong>{' '}
                            {new Date(bid.bid_time).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-300">No bid history.</p>
                  )}
                </div>
              )}
            </Item>
          );
        })}
      </div>
    </Section>
  );

  // =============== OPTIONS ===============
  const renderOptionsTab = () => (
    <Section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Options</h2>
        <button
          onClick={() => setModal({ type: 'add-option', data: null })}
          className="p-2 bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add Option
        </button>
      </div>

      {/* Карточки опций (2-3 на ряд в зависимости от экрана) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => {
          const showMessages = !!optionMessages[option.id];
          return (
            <Item
              key={option.id}
              title={option.name}
              subtitle={`Cost: $${option.cost}`}
              onClick={() => setModal({ type: 'edit-option', data: option })}
              onDelete={() => handleDeleteOption(option.id)}
            >
              <div className="flex items-center space-x-2 mt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewMessages(option.id);
                  }}
                  className="p-1 bg-yellow-600 hover:bg-yellow-500 rounded text-sm"
                >
                  {showMessages ? 'Hide Messages' : 'View Messages'}
                </button>
              </div>

              {showMessages && (
                <div className="mt-3 bg-gray-600 p-2 rounded">
                  <p className="font-semibold">Messages:</p>
                  {optionMessages[option.id] && optionMessages[option.id].length > 0 ? (
                    <ul className="mt-2 space-y-2">
                      {optionMessages[option.id].map((msg) => (
                        <li key={msg.id} className="bg-gray-700 p-2 rounded">
                          <p>
                            <strong>User ID:</strong> {msg.user_id}
                          </p>
                          <p>
                            <strong>Email:</strong> {msg.email}
                          </p>
                          <p>
                            <strong>Payment Method:</strong> {msg.payment_method}
                          </p>
                          <p>
                            <strong>Message:</strong> {msg.message}
                          </p>
                          <p>
                            <strong>Cost:</strong> ${msg.cost.toFixed(2)}
                          </p>
                          <p>
                            <strong>Created At:</strong>{' '}
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-300">No messages.</p>
                  )}
                </div>
              )}
            </Item>
          );
        })}
      </div>
    </Section>
  );

  // =============== USERS ===============
  const renderUsersTab = () => (
    <Section>
      <h2 className="text-xl font-bold mb-4">Users</h2>
      
      {/* Теперь тоже делаем сетку на 4-5 колонки */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer"
          >
            <h3 className="text-lg font-semibold">{user.username}</h3>
            <p className="text-sm text-gray-400">
              {user.is_banned ? 'Banned' : user.is_admin ? 'Admin' : 'Active'}
            </p>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => handleBanUser(user.id, !user.is_banned)}
                className={`p-1 rounded-md ${
                  user.is_banned ? 'bg-green-600' : 'bg-red-600'
                } text-sm`}
              >
                {user.is_banned ? 'Unban' : 'Ban'}
              </button>

              {!user.is_banned && (
                <button
                  onClick={() =>
                    user.is_admin
                      ? handleDemoteUser(user.id)
                      : handlePromoteUser(user.id)
                  }
                  className={`p-1 rounded-md ${
                    user.is_admin ? 'bg-gray-600' : 'bg-blue-600'
                  } text-sm`}
                >
                  {user.is_admin ? 'Demote' : 'Promote'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );

  // ======== RENDER ========
  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <ToastContainer />

      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>

      {/* Вкладки */}
      <ul className="flex space-x-4 border-b border-gray-700 mb-6">
        <li>
          <button
            className={`pb-2 ${
              activeTab === 'lots'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('lots')}
          >
            Lots
          </button>
        </li>
        <li>
          <button
            className={`pb-2 ${
              activeTab === 'options'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('options')}
          >
            Options
          </button>
        </li>
        <li>
          <button
            className={`pb-2 ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </li>
      </ul>

      {/* Контент вкладок */}
      {activeTab === 'lots' && renderLotsTab()}
      {activeTab === 'options' && renderOptionsTab()}
      {activeTab === 'users' && renderUsersTab()}

      {/* Модалки */}
      {modal.type === 'add-lot' && (
        <AddLotModal
          onSave={handleAddLot}
          onClose={() => setModal({ type: '', data: null })}
        />
      )}
      {modal.type === 'edit-lot' && modal.data && (
        <EditLotModal
          lot={modal.data}
          onSave={handleEditLot}
          onClose={() => setModal({ type: '', data: null })}
        />
      )}
      {modal.type === 'add-option' && (
        <AddOptionModal
          onSave={handleAddOption}
          onClose={() => setModal({ type: '', data: null })}
        />
      )}
      {modal.type === 'edit-option' && modal.data && (
        <EditOptionModal
          option={modal.data}
          onSave={handleEditOption}
          onClose={() => setModal({ type: '', data: null })}
        />
      )}
    </div>
  );
}
