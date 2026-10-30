import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { complaintService } from '../../services/complaintService';
import { uploadService } from '../../services/uploadService';
import { AiAnalysisCard } from '../../components/AiAnalysisCard';
import {
  Sparkles,
  Upload,
  X,
  Send,
  AlertCircle,
  Building2,
  CheckCircle,
} from 'lucide-react';

const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Water Supply',
  'Bathroom Maintenance',
  'Internet / Wi-Fi',
  'Furniture',
  'Cleaning',
  'Room Maintenance',
  'Safety and Infrastructure',
  'Other',
];

export const SubmitComplaintPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electrical',
    description: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 4) {
      showToast('Maximum 4 photos allowed per complaint', 'warning');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRunAiAnalysis = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Please enter both title and description for AI analysis', 'warning');
      return;
    }
    setAnalyzingAi(true);
    try {
      const res = await complaintService.analyzeWithAi({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        roomId: user?.room_id,
      });
      if (res.success && res.data) {
        setAiAnalysis(res.data);
        showToast('AI analysis completed!', 'success');
        // Auto-suggest category if user hadn't selected one
        if (res.data.category_suggested) {
          setFormData((prev) => ({ ...prev, category: res.data.category_suggested }));
        }
      }
    } catch (err) {
      showToast('AI analysis fallback triggered', 'info');
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedImageUrls = [];
      if (selectedFiles.length > 0) {
        const uploadRes = await uploadService.uploadImages(selectedFiles);
        if (uploadRes.success && uploadRes.data?.urls) {
          uploadedImageUrls = uploadRes.data.urls;
        }
      }

      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        roomId: user?.room_id,
        images: uploadedImageUrls,
        priority: aiAnalysis?.priority_suggested || 'Medium',
      };

      const res = await complaintService.createComplaint(payload);
      if (res.success && res.data) {
        showToast(`Complaint lodged! Code: ${res.data.complaint_code}`, 'success');
        navigate(`/student/complaints/${res.data.id}`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lodge a Maintenance Complaint</h1>
        <p className="text-sm text-slate-500 mt-1">
          Submit details of the problem. Our automated AI triage analyzes urgency and notifies the maintenance team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          {/* Room Banner */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
            <div className="text-slate-600">
              Filing for Room:{' '}
              <strong className="text-slate-900">
                {user?.room ? `Block ${user.room.block} — Room ${user.room.room_number}` : 'Unassigned Room'}
              </strong>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Complaint Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Ceiling fan speed regulator broken & sparking"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Issue Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={analyzingAi}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 transition"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                {analyzingAi ? 'Analyzing...' : 'AI Pre-Check'}
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please explain the problem clearly. Mention whether water is leaking, sparks appear, or if it disrupts daily room activities..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          {/* Photos Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Photographs (Optional, max 4)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-sky-500 transition cursor-pointer relative bg-slate-50/50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-700">Click or drag photos here to upload</p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or WebP up to 5MB each</p>
            </div>

            {/* Preview Thumbnails */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2.5 mt-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 p-1 bg-slate-900/70 text-white rounded-md hover:bg-rose-600 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/25 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Lodging Complaint & Running AI Triage...' : 'Submit Complaint'}
            </button>
          </div>
        </form>

        {/* AI & Guidance Sidebar */}
        <div className="space-y-4">
          {aiAnalysis ? (
            <AiAnalysisCard analysis={aiAnalysis} />
          ) : (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm text-xs text-slate-600 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>AI Automated Triage</span>
              </div>
              <p className="leading-relaxed">
                When you enter your complaint description, our Gemini-powered engine automatically analyzes:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-500 font-medium">
                <li>Priority level (Low, Medium, High, or Urgent)</li>
                <li>Best technician specialization (Electrician, Plumber, IT, etc.)</li>
                <li>Identifies identical duplicate complaints in your wing</li>
                <li>Generates an executive summary for wardens</li>
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRunAiAnalysis}
                  disabled={analyzingAi}
                  className="w-full py-2 px-3 rounded-xl bg-sky-50 text-sky-700 font-bold hover:bg-sky-100 transition border border-sky-200 flex items-center justify-center gap-1.5 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  {analyzingAi ? 'Analyzing...' : 'Run Pre-Check Now'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-800">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Hostel Regulations</span>
            </div>
            <p className="leading-snug">
              For emergency electrical sparks or flooding, submit the ticket with Urgent priority and contact the warden desk immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

