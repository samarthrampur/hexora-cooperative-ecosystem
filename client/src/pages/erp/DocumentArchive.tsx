import React, { useState, useEffect } from 'react';
import { api, getAssetUrl } from '../../services/api';
import { DocumentRecord } from '../../types';
import { FileText, Download, ShieldCheck, Lock, Upload, Plus } from 'lucide-react';

export const DocumentArchive: React.FC = () => {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await api.get<DocumentRecord[]>('/erp/documents');
      setDocs(data);
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
          <FileText className="w-6 h-6 mr-2 text-blue-700" />
          Cooperative Document Vault
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Statutory bylaws, audited balance sheets, minutes of general body meetings, and policy records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-8 text-slate-400">Loading documents...</div>
        ) : docs.length > 0 ? (
          docs.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-start justify-between"
            >
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {d.category}
                    </span>
                    {d.isConfidential && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center">
                        <Lock className="w-2.5 h-2.5 mr-0.5" />
                        Confidential
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">{d.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Uploaded by {d.uploadedByUser?.fullName || 'Administrator'} •{' '}
                    {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <a
                href={getAssetUrl(d.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Download Document"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-slate-500">No documents archived yet.</div>
        )}
      </div>
    </div>
  );
};
