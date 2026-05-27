import { useState, useEffect } from "react";
import { 
  Video, 
  Link as LinkIcon, 
  ExternalLink, 
  Copy, 
  Trash2, 
  History as HistoryIcon,
  Search,
  Loader2,
  Moon,
  Sun,
  CheckCircle2,
  AlertCircle,
  Download,
  Image as ImageIcon,
  Clock,
  Layers,
  Scissors,
  PlayCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VideoLink {
  url: string;
  type: string;
  label: string;
  source: string;
}

interface HistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}

interface Thumbnail {
  url: string;
  timestamp: string;
}

type Tab = "grabber" | "thumbnails" | "clips";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("grabber");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VideoLink[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [extractionMode, setExtractionMode] = useState<"fast" | "deep">("fast");

  // Thumbnail Generator States
  const [thumbUrl, setThumbUrl] = useState("");
  const [thumbCount, setThumbCount] = useState(6); // Match the first select option
  const [thumbRes, setThumbRes] = useState("640");
  const [thumbResults, setThumbResults] = useState<Thumbnail[]>([]);
  const [selectedThumbs, setSelectedThumbs] = useState<string[]>([]);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [thumbError, setThumbError] = useState<string | null>(null);

  // Video Clip Generator States
  const [clipUrl, setClipUrl] = useState("");
  const [clipStartTime, setClipStartTime] = useState(0);
  const [clipDuration, setClipDuration] = useState(10); // Default to 10s
  const [clipResult, setClipResult] = useState<string | null>(null);
  const [clipLoading, setClipLoading] = useState(false);
  const [clipError, setClipError] = useState<string | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem("vdl_history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    const isDark = localStorage.getItem("vdl_theme") === "dark" || 
                  (!localStorage.getItem("vdl_theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    localStorage.setItem("vdl_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem("vdl_history", JSON.stringify(newHistory));
  };

  const handleFetch = async (fetchUrl?: string) => {
    const targetUrl = fetchUrl || url;
    if (!targetUrl) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, mode: extractionMode }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results);
      
      if (data.results.length === 0) {
        setError("No video links discovered on this page.");
      } else {
        const historyItem: HistoryItem = {
          id: Math.random().toString(36).substring(7),
          url: targetUrl,
          title: data.pageTitle,
          timestamp: Date.now(),
        };
        const filteredHistory = history.filter(h => h.url !== targetUrl);
        saveHistory([historyItem, ...filteredHistory].slice(0, 50));
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateThumbnails = async () => {
    if (!thumbUrl) return;

    setThumbLoading(true);
    setThumbError(null);
    setThumbResults([]);
    setSelectedThumbs([]);

    try {
      const response = await fetch("/api/generate-thumbnails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: thumbUrl, 
          count: thumbCount, 
          resolution: thumbRes 
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setThumbResults(data.thumbnails);
    } catch (err: any) {
      setThumbError(err.message || "Thumbnail extraction failed.");
    } finally {
      setThumbLoading(false);
    }
  };

  const handleGenerateClip = async () => {
    if (!clipUrl) return;

    setClipLoading(true);
    setClipError(null);
    setClipResult(null);

    try {
      const response = await fetch("/api/generate-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: clipUrl, 
          startTime: clipStartTime, 
          duration: clipDuration 
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setClipResult(data.url);
    } catch (err: any) {
      setClipError(err.message || "Clip generation failed.");
    } finally {
      setClipLoading(false);
    }
  };

  const handleToggleSelection = (url: string) => {
    setSelectedThumbs(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const handleDownloadSelected = async () => {
    if (selectedThumbs.length === 0) return;
    
    // Download each selected thumbnail individually with a slight delay to avoid browser blocking
    for (const [idx, url] of selectedThumbs.entries()) {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `thumbnail-${idx}.png`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }, idx * 300); // 300ms delay between downloads
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteHistoryItem = (id: string) => {
    saveHistory(history.filter(h => h.id !== id));
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  const formatTime = (seconds: string) => {
    const sec = parseFloat(seconds);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans overflow-x-hidden flex flex-col p-4 md:p-8 selection:bg-[#C9FF00] selection:text-black">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
            Video<span className="text-[#C9FF00]">Studio</span>
          </h1>
          <p className="text-[10px] font-mono tracking-[0.3em] text-neutral-500 uppercase">
            Creative Pipeline Engine / v2.6.0
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <nav className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button 
              onClick={() => setActiveTab("grabber")}
              className={`px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'grabber' ? 'bg-[#C9FF00] text-black shadow-[0_0_20px_rgba(201,255,0,0.2)]' : 'text-neutral-500 hover:text-white'}`}
            >
              Link Grabber
            </button>
            <button 
              onClick={() => setActiveTab("thumbnails")}
              className={`px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'thumbnails' ? 'bg-[#C9FF00] text-black shadow-[0_0_20px_rgba(201,255,0,0.2)]' : 'text-neutral-500 hover:text-white'}`}
            >
              Thumbnail Gen
            </button>
            <button 
              onClick={() => setActiveTab("clips")}
              className={`px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'clips' ? 'bg-[#C9FF00] text-black shadow-[0_0_20px_rgba(201,255,0,0.2)]' : 'text-neutral-500 hover:text-white'}`}
            >
              Video Clips
            </button>
          </nav>
          
          <div className="flex gap-4 items-center">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">System Status</p>
              <p className={`text-xs font-mono text-[#C9FF00]`}>
                ● {(loading || thumbLoading || clipLoading) ? 'PROCESSING' : 'READY'}
              </p>
            </div>
            <div className="hidden md:block h-12 w-px bg-neutral-800"></div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="h-12 w-12 rounded-full border border-neutral-800 flex items-center justify-center hover:bg-neutral-900 transition-colors"
            >
              {darkMode ? <Sun size={20} className="text-[#C9FF00]" /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1">
        {activeTab === "grabber" ? (
          <>
            {/* Sidebar Section */}
            <section className="md:col-span-4 flex flex-col gap-8 order-2 md:order-1">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold block">
                  Target URL Input
                </label>
                <div className="relative group">
                  <textarea 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleFetch())}
                    className="w-full h-32 bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-4 text-sm font-mono focus:border-[#C9FF00] outline-none transition-all resize-none placeholder:text-neutral-700 text-neutral-200" 
                    placeholder="Paste website URL here..." 
                    spellCheck="false"
                  />
                </div>
                <button 
                  onClick={() => handleFetch()}
                  disabled={loading || !url}
                  className="w-full py-5 bg-[#C9FF00] text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_40px_rgba(201,255,0,0.15)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Extract Video Assets"}
                </button>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono">
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 border-t border-neutral-800 pt-6">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-4">History</h3>
                <div className="space-y-3">
                  {history.map((item, idx) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 text-xs font-mono cursor-pointer group hover:text-[#C9FF00] transition-colors"
                      onClick={() => { setUrl(item.url); handleFetch(item.url); }}
                    >
                      <span className="text-neutral-600">{(idx + 1).toString().padStart(2, '0')}</span>
                      <span className="truncate flex-1 text-neutral-400 group-hover:text-white">{item.title}</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-neutral-600 hover:text-red-500"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  {history.length > 0 && <button onClick={clearHistory} className="text-[9px] uppercase tracking-widest text-neutral-600 hover:text-neutral-400 mt-4">[ Clear ]</button>}
                </div>
              </div>
            </section>

            {/* Results Section */}
            <section className="md:col-span-8 bg-neutral-900 rounded-[32px] border border-neutral-800 overflow-hidden flex flex-col order-1 md:order-2 shadow-2xl">
              <div className="p-6 border-b border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-sm uppercase tracking-widest font-bold">Detected Assets ({results.length})</h2>
                <div className="flex gap-2">
                  <button onClick={() => setExtractionMode("fast")} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${extractionMode === "fast" ? "bg-[#C9FF00] text-black" : "bg-neutral-800 text-neutral-500"}`}>Fast</button>
                  <button onClick={() => setExtractionMode("deep")} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${extractionMode === "deep" ? "bg-[#C9FF00] text-black" : "bg-neutral-800 text-neutral-500"}`}>Deep</button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[400px]">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#C9FF00] animate-pulse">
                    <Loader2 className="animate-spin mb-4" size={48} />
                    <p className="text-[10px] uppercase tracking-widest font-mono">Running Deep Extraction...</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-700 opacity-20 py-20">
                    <Video size={64} className="mb-4" />
                    <p className="text-[10px] uppercase font-mono tracking-widest">Awaiting signal...</p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-800">
                    {results.map((item, idx) => (
                      <div key={idx} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:bg-neutral-950/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-white truncate font-bold mb-1">{item.url.split('/').pop()}</p>
                          <p className="text-[10px] text-neutral-600 truncate font-mono">{item.url}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400 text-[10px] font-mono rounded">{item.type.toUpperCase()}</span>
                            <span className="px-2 py-0.5 bg-neutral-800 text-[#C9FF00] text-[10px] font-mono rounded">{item.label}</span>
                          </div>
                        </div>
                        <div className="flex gap-3 shrink-0">
                          <button onClick={() => copyToClipboard(item.url, `copy-${idx}`)} className={`h-10 px-4 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${copiedId === `copy-${idx}` ? 'bg-[#C9FF00] text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
                            <Copy size={12} /> {copiedId === `copy-${idx}` ? 'Done' : 'Copy'}
                          </button>
                          <button 
                            onClick={() => { setThumbUrl(item.url); setActiveTab("thumbnails"); }}
                            className="h-10 px-4 bg-white text-black text-[10px] font-black uppercase rounded-xl hover:bg-[#C9FF00] transition-colors"
                          >
                            Generate Thumbs
                          </button>
                          <button 
                            onClick={() => { setClipUrl(item.url); setActiveTab("clips"); }}
                            className="h-10 px-4 bg-neutral-800 text-white text-[10px] font-black uppercase rounded-xl hover:bg-[#C9FF00] hover:text-black transition-colors"
                          >
                            Create Clip
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : activeTab === "thumbnails" ? (
          /* Thumbnail Generator View */
          <>
            <section className="md:col-span-4 space-y-8 order-2 md:order-1">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold block">Video Source URL</label>
                <div className="relative group">
                  <input 
                    type="text"
                    value={thumbUrl}
                    onChange={(e) => setThumbUrl(e.target.value)}
                    className="w-full bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-4 text-sm font-mono focus:border-[#C9FF00] outline-none transition-all placeholder:text-neutral-700" 
                    placeholder="Direct .mp4 or .m3u8 link..." 
                  />
                  <div className="absolute right-4 top-4 text-[#C9FF00]">
                    <Video size={18} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold block mb-2">Quantity</label>
                    <select 
                      value={thumbCount}
                      onChange={(e) => setThumbCount(parseInt(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs font-mono outline-none focus:border-[#C9FF00]"
                    >
                      {[6, 10, 15, 20].map(c => <option key={c} value={c}>{c} Thumbnails</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold block mb-2">Resolution</label>
                    <select 
                      value={thumbRes}
                      onChange={(e) => setThumbRes(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs font-mono outline-none focus:border-[#C9FF00]"
                    >
                      <option value="320">320px (Low)</option>
                      <option value="640">640px (Med)</option>
                      <option value="1280">1280px (HD)</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleGenerateThumbnails}
                  disabled={thumbLoading || !thumbUrl}
                  className="w-full py-5 bg-[#C9FF00] text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_40px_rgba(201,255,0,0.15)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {thumbLoading ? <Loader2 className="animate-spin" size={18} /> : <>Generate Gallery <ImageIcon size={16} /></>}
                </button>

                <AnimatePresence>
                  {thumbError && (
                    <motion.div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono">
                      {thumbError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl">
                <h4 className="text-[10px] uppercase font-bold tracking-widest mb-4">Pipeline Rules</h4>
                <ul className="space-y-2 text-[10px] font-mono text-neutral-500">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#C9FF00]" /> Only direct media URLs supported</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#C9FF00]" /> HLS streams may take longer</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#C9FF00]" /> Temporary storage auto-wipes</li>
                </ul>
              </div>
            </section>

            <section className="md:col-span-8 bg-neutral-900 rounded-[32px] border border-neutral-800 overflow-hidden flex flex-col shadow-2xl relative">
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm uppercase tracking-widest font-bold">Timeline Preview ({thumbResults.length})</h2>
                  {selectedThumbs.length > 0 && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="px-2 py-1 bg-[#C9FF00] text-black text-[10px] font-black rounded-full"
                    >
                      {selectedThumbs.length} Selected
                    </motion.div>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedThumbs.length > 0 && (
                    <button 
                      onClick={handleDownloadSelected}
                      className="px-4 h-9 bg-[#C9FF00] text-black text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(201,255,0,0.3)]"
                    >
                      <Download size={14} /> Download Selected
                    </button>
                  )}
                  <span className="text-[10px] uppercase font-mono text-neutral-500 hidden sm:block">Engine: Smart_FFmpeg_v2</span>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar min-h-[500px]">
                {thumbLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-amber-500 py-32">
                    <Loader2 className="animate-spin mb-4" size={48} />
                    <p className="text-[10px] uppercase tracking-widest font-mono">Analyzing Visual Sharpness...</p>
                  </div>
                ) : thumbResults.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-700 opacity-20 py-32">
                    <Layers size={64} className="mb-4" />
                    <p className="text-[10px] uppercase font-mono tracking-widest">Gallery Empty</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {thumbResults.map((thumb, idx) => {
                      const isSelected = selectedThumbs.includes(thumb.url);
                      return (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`group relative bg-neutral-800 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${isSelected ? 'border-[#C9FF00] ring-4 ring-[#C9FF00]/10' : 'border-neutral-700 hover:border-neutral-500'}`}
                          onClick={() => handleToggleSelection(thumb.url)}
                        >
                          <img 
                            src={thumb.url} 
                            alt={`Thumbnail at ${thumb.timestamp}`} 
                            className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* Selection Badge */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 bg-[#C9FF00] text-black p-1 rounded-full shadow-lg z-20">
                              <CheckCircle2 size={16} />
                            </div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex justify-between items-end">
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] uppercase tracking-widest text-neutral-400 font-bold">Timestamp</span>
                              <span className="text-[10px] font-mono text-[#C9FF00] font-black flex items-center gap-1">
                                <Clock size={10} /> {formatTime(thumb.timestamp)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {/* Selection overlay button (visible on hover if not selected) */}
                              <div className={`p-2 rounded-lg transition-all ${isSelected ? 'bg-white text-black' : 'bg-white/10 backdrop-blur-md text-white opacity-0 group-hover:opacity-100'}`}>
                                {isSelected ? <Layers size={14} /> : <div className="w-3.5 h-3.5 border-2 border-white rounded-sm" />}
                              </div>
                              <a 
                                href={thumb.url}
                                download
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 bg-[#C9FF00] text-black rounded-lg hover:scale-110 transition-transform shadow-lg"
                              >
                                <Download size={14} />
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          /* Video Clip Generator View */
          <>
            <section className="md:col-span-4 space-y-8 order-2 md:order-1">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold block">Video Source URL</label>
                <div className="relative group">
                  <input 
                    type="text"
                    value={clipUrl}
                    onChange={(e) => setClipUrl(e.target.value)}
                    className="w-full bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-4 text-sm font-mono focus:border-[#C9FF00] outline-none transition-all placeholder:text-neutral-700" 
                    placeholder="Direct .mp4 or .m3u8 link..." 
                  />
                  <div className="absolute right-4 top-4 text-[#C9FF00]">
                    <Video size={18} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold block mb-2">Total Duration (sec)</label>
                    <select 
                      value={clipDuration}
                      onChange={(e) => setClipDuration(parseInt(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs font-mono outline-none focus:border-[#C9FF00]"
                    >
                      {[9, 12, 15, 18].map(d => <option key={d} value={d}>{d} Seconds (Mashup)</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleGenerateClip}
                  disabled={clipLoading || !clipUrl}
                  className="w-full py-5 bg-[#C9FF00] text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_40px_rgba(201,255,0,0.15)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {clipLoading ? <Loader2 className="animate-spin" size={18} /> : <>Create Mashup Preview <Scissors size={16} /></>}
                </button>

                <AnimatePresence>
                  {clipError && (
                    <motion.div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono">
                      {clipError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl">
                <h4 className="text-[10px] uppercase font-bold tracking-widest mb-4">Clip Engine Info</h4>
                <ul className="space-y-2 text-[10px] font-mono text-neutral-500">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#C9FF00]" /> Fast-cut via Frame Seek</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#C9FF00]" /> Pre-render for instant preview</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#C9FF00]" /> High efficiency MP4 output</li>
                </ul>
              </div>
            </section>

            <section className="md:col-span-8 bg-neutral-900 rounded-[32px] border border-neutral-800 overflow-hidden flex flex-col shadow-2xl relative">
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10">
                <h2 className="text-sm uppercase tracking-widest font-bold">Video Preview Result</h2>
                <div className="flex gap-4">
                  <span className="text-[10px] uppercase font-mono text-neutral-500">Codec: x264_MAIN</span>
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col items-center justify-center h-full min-h-[500px]">
                {clipLoading ? (
                  <div className="flex flex-col items-center justify-center text-amber-500">
                    <Loader2 className="animate-spin mb-4" size={48} />
                    <p className="text-[10px] uppercase tracking-widest font-mono">Splicing Media Streams...</p>
                  </div>
                ) : clipResult ? (
                  <div className="w-full max-w-2xl space-y-6">
                    <div className="aspect-video bg-black rounded-3xl overflow-hidden border-4 border-neutral-800 shadow-2xl relative group">
                      <video 
                        key={clipResult}
                        src={clipResult} 
                        controls 
                        className="w-full h-full object-contain"
                        autoPlay
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                      <a 
                        href={clipResult} 
                        download={`preview_clip_${clipDuration}s.mp4`}
                        className="px-8 py-4 bg-[#C9FF00] text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_30px_rgba(201,255,0,0.2)]"
                      >
                        <Download size={18} /> Download Preview MP4
                      </a>
                      <button 
                        onClick={() => { setClipResult(null); }}
                        className="px-8 py-4 bg-neutral-800 text-neutral-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:text-white transition-colors"
                      >
                        Reset Segment
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-700 opacity-20">
                    <PlayCircle size={64} className="mb-4" />
                    <p className="text-[10px] uppercase font-mono tracking-widest">Awaiting Cut Order</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="mt-12 pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex gap-8 text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500">
          <p>Build_v2.6.0</p>
          <p>Encrypted_Tunnel</p>
          <p>FFmpeg_Optimized</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500">System Priority</span>
          <div className="w-32 h-1 bg-neutral-900 rounded-full">
            <motion.div initial={{ width: "0%" }} animate={{ width: (loading || thumbLoading) ? "95%" : "20%" }} className={`h-full ${(loading || thumbLoading) ? 'bg-amber-500 shadow-[0_0_10px_orange]' : 'bg-[#C9FF00]'}`} />
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C9FF00; }
      `}} />
    </div>
  );
}
