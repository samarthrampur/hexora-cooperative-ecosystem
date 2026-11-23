import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Department } from '../../types';
import { Network, Users, Plus, Building2 } from 'lucide-react';

export const OrgHierarchy: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await api.get<Department[]>('/erp/departments');
      setDepartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <Network className="w-6 h-6 mr-2 text-blue-700" />
          Organizational Structure & Departments
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Governance hierarchy, specialized divisions, and member allocations within the cooperative.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-8 text-slate-400">Loading departments...</div>
        ) : (
          departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{dept.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{dept.description || 'Operational Division'}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {dept._count?.members || 0} Allocated Members
                </span>
                <span className="font-bold text-blue-700">Active Division</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
