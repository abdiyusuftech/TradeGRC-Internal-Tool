import React, { useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { ContractorRecord } from '../types';

interface EditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ContractorRecord;
  onSave: (updated: ContractorRecord) => void;
  onResetToDefault: () => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  isOpen,
  onClose,
  record,
  onSave,
  onResetToDefault
}) => {
  const [formData, setFormData] = useState<ContractorRecord>(record);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-14 px-4 bg-[#1B2126]/75 backdrop-blur-[2px] overflow-y-auto pb-12">
      <div 
        id="edit-record-modal"
        className="w-full max-w-2xl bg-white border border-[#14212E]/20 rounded-[6px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#1B2126] text-white flex items-center justify-between gap-3">
          <div>
            <h2 className="font-['Archivo'] font-extrabold text-[17px] text-white">
              Edit Public Record Fields
            </h2>
            <p className="text-[12px] font-mono text-[#A3AFB8] mt-0.5">
              Ref {record.reference} &middot; Real-time recalculated compliance
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#A3AFB8] hover:text-white hover:bg-[#273037] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          
          {/* General Trade Info */}
          <div>
            <h3 className="font-['Archivo'] font-bold text-[14px] uppercase text-[#1B2126] pb-1 border-b border-[#14212E]/15">
              Contractor Identification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-[#4C5A67] mb-1">
                  Trade Name (Operating Name)
                </label>
                <input
                  type="text"
                  name="tradeName"
                  value={formData.tradeName}
                  onChange={handleChange}
                  className="w-full font-mono text-[13px] bg-[#EAEEEE] border border-[#14212E]/20 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1501C]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-[#4C5A67] mb-1">
                  Legal Corporate Name
                </label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleChange}
                  className="w-full font-mono text-[13px] bg-[#EAEEEE] border border-[#14212E]/20 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1501C]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-mono text-[11px] uppercase font-semibold text-[#4C5A67] mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full font-mono text-[13px] bg-[#EAEEEE] border border-[#14212E]/20 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1501C]"
                />
              </div>
            </div>
          </div>

          {/* WSIB Record */}
          <div>
            <h3 className="font-['Archivo'] font-bold text-[14px] uppercase text-[#1B2126] pb-1 border-b border-[#14212E]/15">
              WSIB Clearance Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-[#4C5A67] mb-1">
                  Certificate Number
                </label>
                <input
                  type="text"
                  name="certNumber"
                  value={formData.certNumber}
                  onChange={handleChange}
                  className="w-full font-mono text-[13px] bg-[#EAEEEE] border border-[#14212E]/20 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1501C]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-[#4C5A67] mb-1">
                  Account Status
                </label>
                <input
                  type="text"
                  name="accountStatus"
                  value={formData.accountStatus}
                  onChange={handleChange}
                  className="w-full font-mono text-[13px] bg-[#EAEEEE] border border-[#14212E]/20 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1501C]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-[#4C5A67] mb-1">
                  Certificate Expiry Date (ISO YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  name="certValidToISO"
                  value={formData.certValidToISO}
                  onChange={(e) => {
                    const iso = e.target.value;
                    const dateObj = new Date(iso);
                    const formatted = !isNaN(dateObj.getTime())
                      ? dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
                      : iso;
                    setFormData((prev) => ({
                      ...prev,
                      certValidToISO: iso,
                      certValidTo: formatted
                    }));
                  }}
                  className="w-full font-mono text-[13px] bg-[#EAEEEE] border border-[#14212E]/20 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1501C]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-[#4C5A67] mb-1">
                  NAICS WSIB Classification
                </label>
                <input
                  type="text"
                  name="naicsWsib"
                  value={formData.naicsWsib}
                  onChange={handleChange}
                  className="w-full font-mono text-[13px] bg-[#EAEEEE] border border-[#14212E]/20 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1501C]"
                />
              </div>
            </div>
          </div>

          {/* Ontario Registry */}
          <div>
            <h3 className="font-['Archivo'] font-bold text-[14px] uppercase text-[#1B2126] pb-1 border-b border-[#14212E]/15">
              Ontario Business Registry (ONBIS)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-[#4C5A67] mb-1">
                  BIN (Business ID Number)
                </label>
                <input
                  type="text"
                  name="bin"
                  value={formData.bin}
                  onChange={handleChange}
                  className="w-full font-mono text-[13px] bg-[#EAEEEE] border border-[#14212E]/20 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1501C]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-[#4C5A67] mb-1">
                  Registry Status
                </label>
                <input
                  type="text"
                  name="registryStatus"
                  value={formData.registryStatus}
                  onChange={handleChange}
                  className="w-full font-mono text-[13px] bg-[#EAEEEE] border border-[#14212E]/20 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1501C]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-[#4C5A67] mb-1">
                  Registration Expiry (ISO YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  name="registrationExpiryISO"
                  value={formData.registrationExpiryISO}
                  onChange={(e) => {
                    const iso = e.target.value;
                    const dateObj = new Date(iso);
                    const formatted = !isNaN(dateObj.getTime())
                      ? dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
                      : iso;
                    setFormData((prev) => ({
                      ...prev,
                      registrationExpiryISO: iso,
                      registrationExpiry: formatted
                    }));
                  }}
                  className="w-full font-mono text-[13px] bg-[#EAEEEE] border border-[#14212E]/20 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1501C]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-[#4C5A67] mb-1">
                  Business Type
                </label>
                <input
                  type="text"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full font-mono text-[13px] bg-[#EAEEEE] border border-[#14212E]/20 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1501C]"
                />
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-[#14212E]/15 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onResetToDefault();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[12px] uppercase text-[#7C8D99] hover:text-[#16222C] hover:bg-[#EAEEEE] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-[#14212E]/20 rounded font-mono text-[12px] uppercase text-[#4C5A67] hover:bg-[#EAEEEE] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1B2126] hover:bg-[#313C44] text-white rounded font-mono text-[12px] uppercase font-semibold transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Record</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
