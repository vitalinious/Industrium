import { useState } from 'react';
import axios from 'axios';

export default function useDeleteItem({ endpoint, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const deleteItem = async (id) => {
    if (!window.confirm("Ви впевнені, що хочете видалити?")) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      await axios.delete(`/api/${endpoint}/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onSuccess) onSuccess(id);
    } catch (err) {
      console.error("Помилка видалення:", err);
      alert("Не вдалося видалити запис");
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteItem, isLoading };
}