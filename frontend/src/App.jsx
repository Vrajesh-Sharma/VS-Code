// import { useState } from "react";

// const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

// function App() {
//   const [file, setFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [overlayUrl, setOverlayUrl] = useState(null);
//   const [maskUrl, setMaskUrl] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleFileChange = (e) => {
//     const f = e.target.files?.[0] ?? null;
//     setFile(f);
//     setOverlayUrl(null);
//     setMaskUrl(null);
//     setError(null);

//     if (f) {
//       setPreviewUrl(URL.createObjectURL(f));
//     } else {
//       setPreviewUrl(null);
//     }
//   };

//   const handleAnalyze = async () => {
//     const [stats, setStats] = useState(null);
//     if (!file) {
//       setError("Please choose an MRI slice image first.");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const res = await fetch(`${API_BASE}/predict`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) {
//         let detail = "Server error";
//         try {
//           const body = await res.json();
//           detail = body.detail ?? detail;
//         } catch (_) {}
//         throw new Error(detail);
//       }

//       const data = await res.json();
//       setOverlayUrl(data.overlay_image);
//       setStats(data.stats);
//       setMaskUrl(data.raw_mask);
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Failed to analyze image.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
//       <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
//         <h1 className="text-xl font-semibold tracking-tight">
//           NeuroVision · Brain Tumor Segmentation
//         </h1>
//         <span className="text-xs text-slate-400">
//           BraTS2020 · U-Net · Prototype
//         </span>
//       </header>

//       <main className="flex-1 flex items-center justify-center px-4 py-8">
//         <div className="w-full max-w-5xl grid gap-8 md:grid-cols-[1.2fr,1.8fr]">
//           {/* Left: upload + controls */}
//           <div className="space-y-6">
//             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
//               <h2 className="text-lg font-semibold mb-4">Upload MRI Slice</h2>

//               <label className="block">
//                 <span className="sr-only">Choose MRI slice</span>
//                 <input
//                   type="file"
//                   accept="image/png,image/jpeg"
//                   onChange={handleFileChange}
//                   className="block w-full text-sm text-slate-300
//                     file:mr-4 file:py-2 file:px-4
//                     file:rounded-full file:border-0
//                     file:text-sm file:font-semibold
//                     file:bg-emerald-500/10 file:text-emerald-300
//                     hover:file:bg-emerald-500/20"
//                 />
//               </label>

//               <button
//                 onClick={handleAnalyze}
//                 disabled={loading || !file}
//                 className="mt-4 inline-flex items-center justify-center rounded-full
//                   bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950
//                   hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed
//                   transition-colors"
//               >
//                 {loading ? "Analyzing..." : "Analyze Tumor Regions"}
//               </button>

//               {error && (
//                 <p className="mt-3 text-sm text-red-400">
//                   {error}
//                 </p>
//               )}

//               <p className="mt-3 text-xs text-slate-400">
//                 Upload a single MRI slice as PNG or JPEG. The model will
//                 predict tumor regions and return a color overlay.
//               </p>
//             </div>

//             {previewUrl && (
//               <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
//                 <h3 className="text-sm font-medium mb-2">Input Preview</h3>
//                 <img
//                   src={previewUrl}
//                   alt="Input MRI"
//                   className="w-full max-h-80 object-contain rounded-lg border border-slate-800 bg-black"
//                 />
//               </div>
//             )}
//           </div>

//           {/* Right: results */}
//           <div className="space-y-6">
//             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full">
//               <h2 className="text-lg font-semibold mb-4">
//                 Predicted Tumor Segmentation
//               </h2>

//               {!overlayUrl && !loading && (
//                 <p className="text-sm text-slate-400">
//                   Upload an image and click{" "}
//                   <span className="font-semibold">Analyze Tumor Regions</span>{" "}
//                   to see the segmented tumor overlaid on the MRI.
//                 </p>
//               )}

//               {loading && (
//                 <div className="flex items-center space-x-3 text-sm text-slate-300">
//                   <span className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
//                   <span>Running inference on the MRI slice...</span>
//                 </div>
//               )}

//               {overlayUrl && (
//                 <div className="grid gap-4 md:grid-cols-2 mt-4">
//                   <div>
//                     <p className="text-xs text-slate-400 mb-1">
//                       MRI + Tumor Overlay
//                     </p>
//                     <img
//                       src={overlayUrl}
//                       alt="Prediction overlay"
//                       className="w-full max-h-96 object-contain rounded-lg border border-slate-800 bg-black"
//                     />
//                   </div>
//                   {maskUrl && (
//                     <div>
//                       <p className="text-xs text-slate-400 mb-1">
//                         Tumor Mask Only
//                       </p>
//                       <img
//                         src={maskUrl}
//                         alt="Tumor mask"
//                         className="w-full max-h-96 object-contain rounded-lg border border-slate-800 bg-black"
//                       />
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>

//       <footer className="px-6 py-3 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
//         <span>Hackathon Prototype · BraTS2020</span>
//         <span>Backend: FastAPI · Frontend: React + Vite + Tailwind v4</span>
//       </footer>
//     </div>
//   );
// }

// export default App;




// src/App.jsx
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [overlayUrl, setOverlayUrl] = useState(null);
  const [maskUrl, setMaskUrl] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setOverlayUrl(null);
    setMaskUrl(null);
    setStats(null);
    setError(null);

    if (f) {
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please choose an MRI slice image first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let detail = "Server error";
        try {
          const body = await res.json();
          detail = body.detail ?? detail;
        } catch (_) {}
        throw new Error(detail);
      }

      const data = await res.json();
      setOverlayUrl(data.overlay_image);
      setMaskUrl(data.raw_mask);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to analyze image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <span className="text-emerald-400 text-sm font-bold">NV</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            NeuroVision
            <span className="ml-2 text-xs font-normal text-slate-400">
              Brain Tumor Segmentation
            </span>
          </h1>
        </div>
        <span className="text-xs text-slate-500 hidden md:block">
          BraTS2020 · U-Net · Deep Learning
        </span>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.2fr,1.8fr]">

          {/* LEFT PANEL */}
          <div className="space-y-5">

            {/* Upload card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-semibold mb-1">Upload MRI Slice</h2>
              <p className="text-xs text-slate-400 mb-4">
                PNG or JPEG brain MRI slice image
              </p>

              {/* Drop zone */}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors">
                <svg
                  className="w-8 h-8 text-slate-500 mb-2"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <span className="text-xs text-slate-400">
                  {file ? file.name : "Click to choose image"}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleAnalyze}
                disabled={loading || !file}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl
                  bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950
                  hover:bg-emerald-400 active:scale-95 disabled:opacity-50
                  disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Tumor Regions"
                )}
              </button>

              {error && (
                <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* Input preview */}
            {previewUrl && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h3 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Input Preview
                </h3>
                <img
                  src={previewUrl}
                  alt="Input MRI"
                  className="w-full max-h-72 object-contain rounded-xl border border-slate-800 bg-black"
                />
              </div>
            )}

            {/* Legend */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h3 className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">
                Color Legend
              </h3>
              <div className="space-y-2">
                {[
                  { color: "bg-green-500",  label: "Edema",           desc: "Class 1" },
                  { color: "bg-yellow-400", label: "Necrotic Core",   desc: "Class 2" },
                  { color: "bg-red-500",    label: "Enhancing Tumor", desc: "Class 3" },
                ].map(({ color, label, desc }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                    <span className="text-sm">{label}</span>
                    <span className="text-xs text-slate-500 ml-auto">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-5">

            {/* Results card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-80">
              <h2 className="text-base font-semibold mb-4">
                Predicted Tumor Segmentation
              </h2>

              {/* Empty state */}
              {!overlayUrl && !loading && (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400">
                    No analysis yet. Upload an MRI slice and click Analyze.
                  </p>
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="h-10 w-10 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
                  <p className="text-sm text-slate-300">Running inference on MRI slice...</p>
                </div>
              )}

              {/* Prediction images */}
              {overlayUrl && !loading && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                      MRI + Tumor Overlay
                    </p>
                    <img
                      src={overlayUrl}
                      alt="Prediction overlay"
                      className="w-full max-h-80 object-contain rounded-xl border border-slate-800 bg-black"
                    />
                  </div>
                  {maskUrl && (
                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                        Tumor Mask Only
                      </p>
                      <img
                        src={maskUrl}
                        alt="Tumor mask"
                        className="w-full max-h-80 object-contain rounded-xl border border-slate-800 bg-black"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats card */}
            {stats && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-base font-semibold mb-4">Analysis Results</h2>

                {/* Detection banner */}
                <div className={`rounded-xl px-4 py-3 mb-4 border ${
                  stats.tumor_detected
                    ? "bg-red-500/10 border-red-500/20"
                    : "bg-green-500/10 border-green-500/20"
                }`}>
                  <p className={`text-sm font-semibold ${
                    stats.tumor_detected ? "text-red-400" : "text-green-400"
                  }`}>
                    {stats.tumor_detected
                      ? "⚠ Tumor regions detected"
                      : "✓ No tumor regions detected"}
                  </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">Tumor Area</p>
                    <p className="text-xl font-bold">
                      {stats.tumor_area_pct}
                      <span className="text-sm font-normal text-slate-400 ml-1">%</span>
                    </p>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">Tumor Pixels</p>
                    <p className="text-xl font-bold">
                      {stats.tumor_pixel_count.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-3 border-l-2 border-green-500">
                    <p className="text-xs text-green-400 mb-1">Edema</p>
                    <p className="text-base font-semibold">
                      {stats.class_counts.edema.toLocaleString()}
                      <span className="text-xs text-slate-400 ml-1">px</span>
                    </p>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-3 border-l-2 border-yellow-400">
                    <p className="text-xs text-yellow-400 mb-1">Necrotic Core</p>
                    <p className="text-base font-semibold">
                      {stats.class_counts.necrotic_core.toLocaleString()}
                      <span className="text-xs text-slate-400 ml-1">px</span>
                    </p>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-3 border-l-2 border-red-500 col-span-2">
                    <p className="text-xs text-red-400 mb-1">Enhancing Tumor</p>
                    <p className="text-base font-semibold">
                      {stats.class_counts.enhancing_tumor.toLocaleString()}
                      <span className="text-xs text-slate-400 ml-1">px</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-slate-800 text-xs text-slate-600 flex justify-between">
        <span>NeuroVision · Hackathon Prototype</span>
        <span>FastAPI · React · Vite · Tailwind v4</span>
      </footer>
    </div>
  );
}

export default App;