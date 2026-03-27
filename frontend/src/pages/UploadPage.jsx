import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UploadCloud, FileImage, X } from 'lucide-react';
import useStore from '../store/useStore';

const formSchema = z.object({
  patientName: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(0, 'Age must be positive').max(120, 'Invalid age'),
  notes: z.string().optional(),
});

export default function UploadPage() {
  const navigate = useNavigate();
  const { setPatientInfo, setMriImage } = useStore();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data) => {
    if (!file) {
      alert("Please upload an MRI image.");
      return;
    }
    setPatientInfo(data);
    setMriImage(file);
    navigate('/scanner');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-2xl rounded-3xl p-8 md:p-12 shadow-2xl relative z-10"
      >
        <h2 className="text-3xl font-bold mb-8 text-glow">New Scan Session</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Patient Name</label>
              <input 
                {...register('patientName')}
                className="w-full bg-input/50 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                placeholder="Jane Doe"
              />
              {errors.patientName && <p className="text-destructive text-sm mt-1">{errors.patientName.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Age</label>
              <input 
                {...register('age')}
                type="number"
                className="w-full bg-input/50 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                placeholder="45"
              />
              {errors.age && <p className="text-destructive text-sm mt-1">{errors.age.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Clinical Notes (Optional)</label>
            <textarea 
              {...register('notes')}
              className="w-full bg-input/50 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground min-h-[100px] resize-none"
              placeholder="Symptoms, history, etc..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">MRI Upload</label>
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 ${dragActive ? 'border-primary bg-primary/10 box-glow' : 'border-white/20 hover:border-primary/50 hover:bg-white/5'}`}
            >
              <input 
                type="file" 
                onChange={handleChange} 
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {!file ? (
                <>
                  <UploadCloud className="w-12 h-12 text-primary mb-4" />
                  <p className="text-lg font-medium">Drag & Drop or Click to Select</p>
                  <p className="text-sm text-muted-foreground mt-2">Supports DICOM, NIFTI, JPG, PNG</p>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <FileImage className="w-12 h-12 text-primary mb-4" />
                  <p className="text-lg font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    type="button" 
                    onClick={(e) => { e.preventDefault(); setFile(null); }}
                    className="mt-4 flex items-center text-sm text-destructive hover:text-destructive/80"
                  >
                    <X className="w-4 h-4 mr-1" /> Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 mt-8 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:shadow-[0_0_20px_rgba(var(--color-primary),0.6)] hover:bg-primary/90 transition-all duration-300 transform active:scale-[0.98]"
          >
            Process Scan
          </button>
        </form>
      </motion.div>
    </div>
  );
}
