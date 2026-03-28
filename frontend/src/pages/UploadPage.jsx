// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { UploadCloud, FileImage, X, Loader2 } from 'lucide-react';
// import useStore from '../store/useStore';
// import { supabase } from '../lib/supabase';
// import { uploadImage } from '../lib/upload';
// import { toast } from 'sonner';

// const formSchema = z.object({
//   patientName: z.string().min(2, 'Name must be at least 2 characters'),
//   age: z.coerce.number().min(0, 'Age must be positive').max(120, 'Invalid age'),
//   notes: z.string().optional(),
// });

// export default function UploadPage() {
//   const navigate = useNavigate();
//   const { setPatientInfo, setMriImage, setMriFile, setPatientId } = useStore();
//   const [file, setFile] = useState(null);
//   const [dragActive, setDragActive] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(formSchema),
//   });

//   const onSubmit = async (data) => {
//     if (!file) {
//       toast.error("Please upload an MRI image.");
//       return;
//     }
    
//     setIsSubmitting(true);
    
//     try {
//       const { data: userData, error: userError } = await supabase.auth.getUser();
//       if (userError || !userData?.user) {
//         throw new Error("User not authenticated.");
//       }

//       const user = userData.user;

//       // 🔥 STEP 1: Upload the MRI image explicitly to Supabase Storage first.
//       const image_url = await uploadImage(file, "original");
//       if (!image_url) {
//         throw new Error("Image upload completely failed. Ensure you created the INSERT policy on 'scans' bucket.");
//       }

//       // Create profile to satisfy the profiles(id) foreign key constraint
//       await supabase.from('profiles').upsert({ id: user.id });

//       // 🔥 STEP 2: Create Patient using the authenticated ID
//       const { data: newPatientArray, error: dbError } = await supabase.from('patients').insert({
//         user_id: user.id,
//         name: data.patientName,
//         age: data.age,
//         notes: data.notes || null
//       }).select('id');

//       if (dbError) throw new Error("Database error: " + dbError.message);

//       const newPatient = newPatientArray?.[0];
//       if (!newPatient) {
//          throw new Error("Insert succeeded but no rows returned. Ensure your 'patients' table has a SELECT RLS policy.");
//       }

//       // 🔥 STEP 3: Store both the URL (for rendering/database paths) and the File Blob (for Python Backend!)
//       setPatientId(newPatient.id);
//       setPatientInfo(data);
//       setMriImage(image_url);  // Public URL from Storage
//       setMriFile(file);        // Raw Blob File for FastAPI
//       navigate('/scanner');
//     } catch (err) {
//       console.error("Failed to process upload flow:", err);
//       toast.error(err.message || "Error saving data. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === 'dragenter' || e.type === 'dragover') {
//       setDragActive(true);
//     } else if (e.type === 'dragleave') {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       setFile(e.dataTransfer.files[0]);
//     }
//   };

//   const handleChange = (e) => {
//     e.preventDefault();
//     if (e.target.files && e.target.files[0]) {
//       setFile(e.target.files[0]);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
//       <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         className="glass-panel w-full max-w-2xl rounded-3xl p-8 md:p-12 shadow-2xl relative z-10"
//       >
//         <h2 className="text-3xl font-bold mb-8 text-glow">New Scan Session</h2>
        
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-2">
//               <label className="text-sm font-medium text-muted-foreground">Patient Name</label>
//               <input 
//                 {...register('patientName')}
//                 className="w-full bg-input/50 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
//                 placeholder="Jane Doe"
//               />
//               {errors.patientName && <p className="text-destructive text-sm mt-1">{errors.patientName.message}</p>}
//             </div>
            
//             <div className="space-y-2">
//               <label className="text-sm font-medium text-muted-foreground">Age</label>
//               <input 
//                 {...register('age')}
//                 type="number"
//                 className="w-full bg-input/50 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
//                 placeholder="45"
//               />
//               {errors.age && <p className="text-destructive text-sm mt-1">{errors.age.message}</p>}
//             </div>
//           </div>
          
//           <div className="space-y-2">
//             <label className="text-sm font-medium text-muted-foreground">Clinical Notes (Optional)</label>
//             <textarea 
//               {...register('notes')}
//               className="w-full bg-input/50 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground min-h-[100px] resize-none"
//               placeholder="Symptoms, history, etc..."
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium text-muted-foreground">MRI Upload</label>
//             <div 
//               onDragEnter={handleDrag}
//               onDragLeave={handleDrag}
//               onDragOver={handleDrag}
//               onDrop={handleDrop}
//               className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 ${dragActive ? 'border-primary bg-primary/10 box-glow' : 'border-white/20 hover:border-primary/50 hover:bg-white/5'}`}
//             >
//               <input 
//                 type="file" 
//                 onChange={handleChange} 
//                 accept="image/*"
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//               />
              
//               {!file ? (
//                 <>
//                   <UploadCloud className="w-12 h-12 text-primary mb-4" />
//                   <p className="text-lg font-medium">Drag & Drop or Click to Select</p>
//                   <p className="text-sm text-muted-foreground mt-2">Supports DICOM, NIFTI, JPG, PNG</p>
//                 </>
//               ) : (
//                 <div className="flex flex-col items-center">
//                   <FileImage className="w-12 h-12 text-primary mb-4" />
//                   <p className="text-lg font-medium">{file.name}</p>
//                   <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
//                   <button 
//                     type="button" 
//                     onClick={(e) => { e.preventDefault(); setFile(null); }}
//                     className="mt-4 flex items-center text-sm text-destructive hover:text-destructive/80"
//                   >
//                     <X className="w-4 h-4 mr-1" /> Remove
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           <button 
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full py-4 mt-8 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:shadow-[0_0_20px_rgba(var(--color-primary),0.6)] hover:bg-primary/90 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
//           >
//             {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Process Scan'}
//           </button>
//         </form>
//       </motion.div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UploadCloud, FileImage, X, Loader2 } from 'lucide-react';
import useStore from '../store/useStore';
import { supabase } from '../lib/supabase';
import { uploadImage } from '../lib/upload';
import { toast } from 'sonner';

const formSchema = z.object({
  patientName: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(1, 'Age must be > 0').max(120, 'Invalid age'),
  notes: z.string().optional(),
});

export default function UploadPage() {
  const navigate = useNavigate();
  const { setPatientInfo, setMriImage, setMriFile, setPatientId } = useStore();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    if (!file) {
      toast.error("Please upload an MRI image.");
      return;
    }

    // Backend only supports image/png or image/jpeg
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error("Only PNG or JPEG images are supported.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error("User not authenticated.");
      }

      const user = userData.user;

      // Upload MRI image
      const image_url = await uploadImage(file, "original");
      if (!image_url) {
        throw new Error("Image upload failed.");
      }

      await supabase.from('profiles').upsert({ id: user.id });

      const { data: newPatientArray, error: dbError } = await supabase
        .from('patients')
        .insert({
          user_id: user.id,
          name: data.patientName,
          age: data.age,
          notes: data.notes || null,
        })
        .select('id');

      if (dbError) throw dbError;

      const newPatient = newPatientArray?.[0];
      if (!newPatient) throw new Error("Patient creation failed.");

      // Store in Zustand
      setPatientId(newPatient.id);
      setPatientInfo(data); // includes age
      setMriImage(image_url);
      setMriFile(file);

      navigate('/scanner');

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div className="glass-panel w-full max-w-2xl p-8 rounded-3xl">
        <h2 className="text-3xl font-bold mb-8">New Scan Session</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input {...register('patientName')} placeholder="Name" />
          {errors.patientName && <p>{errors.patientName.message}</p>}

          <input {...register('age')} type="number" placeholder="Age" />
          {errors.age && <p>{errors.age.message}</p>}

          <textarea {...register('notes')} placeholder="Notes" />

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className="border-2 border-dashed p-6 text-center"
          >
            <input type="file" onChange={handleChange} accept="image/*" />

            {!file ? (
              <p>Upload MRI (PNG/JPG)</p>
            ) : (
              <div>
                <FileImage />
                <p>{file.name}</p>
                <button onClick={() => setFile(null)} type="button">
                  <X /> Remove
                </button>
              </div>
            )}
          </div>

          <button disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Process Scan'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}