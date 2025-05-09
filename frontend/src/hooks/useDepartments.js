import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export default function useDepartments(initialFilter = {}) {
  const [departments, setDepartments] = useState([]);
  const [filter, setFilter]       = useState(initialFilter);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const fetchDepartments = useCallback(async (params = filter) => {
    setLoading(true);
    try {
      const { data } = await api.get('/departments/', { params });
      setDepartments(data);
      setError(null);
    } catch (err) {
      setError('Не вдалося завантажити відділи');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const createDepartment = useCallback(
    async payload => {
      await api.post('/departments/', payload);
      await fetchDepartments();
    },
    [fetchDepartments]
  );

  const updateDepartment = useCallback(
    async (id, payload) => {
      await api.put(`/departments/${id}/`, payload);
      await fetchDepartments();
    },
    [fetchDepartments]
  );

  const deleteDepartment = useCallback(
    async id => {
      await api.delete(`/departments/${id}/`);
      setDepartments(prev => prev.filter(d => d.id !== id));
    },
    []
  );

  const applyFilter = useCallback(
    async selectedNames => {
      const name = selectedNames.join(',');
      setFilter({ name });
      await fetchDepartments({ name });
    },
    [fetchDepartments]
  );

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments,
    loading,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    applyFilter,
  };
}
