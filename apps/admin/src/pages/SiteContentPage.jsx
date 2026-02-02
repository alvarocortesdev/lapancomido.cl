// src/pages/SiteContentPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as siteContentApi from "../api/siteContent";
import ImageCropperModal from "../components/ImageCropperModal";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// Upload presets for different content types
const UPLOAD_PRESETS = {
  slider_desktop:
    import.meta.env.VITE_CLOUDINARY_PRESET_SLIDER_DESKTOP ||
    "lapancomido_slider_desktop",
  slider_mobile:
    import.meta.env.VITE_CLOUDINARY_PRESET_SLIDER_MOBILE ||
    "lapancomido_slider_mobile",
  gallery:
    import.meta.env.VITE_CLOUDINARY_PRESET_GALLERY || "lapancomido_gallery",
  video: import.meta.env.VITE_CLOUDINARY_PRESET_VIDEO || "lapancomido_video",
};

const TABS = [
  { id: "slider", label: "Slider" },
  { id: "gallery", label: "Galería" },
  { id: "about", label: "Elígenos" },
  { id: "footer", label: "Footer" },
];

export default function SiteContentPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("slider");
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadContent();
  }, [token]);

  async function loadContent() {
    try {
      setLoading(true);
      setError("");
      const data = await siteContentApi.getAllContent(token);
      // Convert array to object keyed by 'key'
      const contentMap = {};
      data.forEach((item) => {
        contentMap[item.key] = item.value;
      });
      setContent(contentMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveContent(key, value) {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await siteContentApi.updateContent(token, key, value);
      setContent((prev) => ({ ...prev, [key]: value }));
      setSuccess("Guardado correctamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-[#262011]/60">Cargando contenido...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#262011] mb-6">
        Contenido del Sitio
      </h1>

      {/* Status messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-t-xl border-b flex overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? "border-[#262011] text-[#262011]"
                : "border-transparent text-[#262011]/60 hover:text-[#262011]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-b-xl shadow-sm p-6">
        {activeTab === "slider" && (
          <SliderEditor
            slides={content.home_slider || []}
            onSave={(slides) => saveContent("home_slider", slides)}
            saving={saving}
          />
        )}
        {activeTab === "gallery" && (
          <GalleryEditor
            images={content.home_gallery || []}
            onSave={(images) => saveContent("home_gallery", images)}
            saving={saving}
          />
        )}
        {activeTab === "about" && (
          <AboutEditor
            data={content.about_section || {}}
            onSave={(data) => saveContent("about_section", data)}
            saving={saving}
          />
        )}
        {activeTab === "footer" && (
          <FooterEditor
            data={content.footer || {}}
            onSave={(data) => saveContent("footer", data)}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

// ============ SLIDER EDITOR ============
function SliderEditor({ slides, onSave, saving }) {
  const [localSlides, setLocalSlides] = useState(slides);
  const [uploading, setUploading] = useState(null); // index of slide being uploaded
  const [cropper, setCropper] = useState({
    isOpen: false,
    imageSrc: null,
    initialAspectRatio: 1,
    onComplete: null,
  });

  useEffect(() => {
    setLocalSlides(slides);
  }, [slides]);

  async function uploadImage(file, type) {
    if (!CLOUDINARY_CLOUD_NAME) {
      throw new Error("Cloudinary no está configurado");
    }

    const preset =
      type === "desktop"
        ? UPLOAD_PRESETS.slider_desktop
        : UPLOAD_PRESETS.slider_mobile;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);
    formData.append("folder", "slider");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData },
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Error al subir imagen");
    }

    return await response.json();
  }

  function handleFileSelect(index, type, e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = "";

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropper({
        isOpen: true,
        imageSrc: reader.result,
        initialAspectRatio: type === "desktop" ? 21 / 9 : 16 / 9,
        onComplete: (blob) => handleCroppedUpload(blob, index, type),
      });
    });
    reader.readAsDataURL(file);
  }

  async function handleCroppedUpload(blob, index, type) {
    try {
      setUploading(index);
      const file = new File([blob], "cropped-image.jpg", {
        type: "image/jpeg",
      });
      const result = await uploadImage(file, type);

      setLocalSlides((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [type]: result.secure_url,
        };
        return updated;
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(null);
    }
  }

  function handleAltChange(index, alt) {
    setLocalSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], alt };
      return updated;
    });
  }

  function addSlide() {
    setLocalSlides((prev) => [...prev, { desktop: "", mobile: "", alt: "" }]);
  }

  function removeSlide(index) {
    if (confirm("¿Eliminar este slide?")) {
      setLocalSlides((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function moveSlide(index, direction) {
    if (
      (direction === -1 && index === 0) ||
      (direction === 1 && index === localSlides.length - 1)
    )
      return;

    setLocalSlides((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + direction];
      updated[index + direction] = temp;
      return updated;
    });
  }

  return (
    <div className="space-y-6">
      <ImageCropperModal
        isOpen={cropper.isOpen}
        onClose={() => setCropper((prev) => ({ ...prev, isOpen: false }))}
        imageSrc={cropper.imageSrc}
        onCropComplete={cropper.onComplete}
        initialAspectRatio={cropper.initialAspectRatio}
      />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#262011]">
            Slider Principal
          </h3>
          <p className="text-sm text-[#262011]/60">
            Imágenes del carrusel en la página de inicio
          </p>
        </div>
        <button
          onClick={addSlide}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
        >
          + Agregar Slide
        </button>
      </div>

      <div className="space-y-4">
        {localSlides.map((slide, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-[#262011]">
                Slide {index + 1}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => moveSlide(index, -1)}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="Mover arriba"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveSlide(index, 1)}
                  disabled={index === localSlides.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="Mover abajo"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeSlide(index)}
                  className="p-1 text-red-400 hover:text-red-600"
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              {/* Desktop Image */}
              <div>
                <label className="block text-sm text-[#262011]/70 mb-1">
                  Desktop (21:9, 1920x823)
                </label>
                <div className="relative aspect-[21/9] bg-gray-100 rounded overflow-hidden">
                  {slide.desktop ? (
                    <img
                      src={slide.desktop}
                      alt="Desktop preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      Sin imagen
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(index, "desktop", e)}
                      className="hidden"
                      disabled={uploading === index}
                    />
                    <span className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                      {uploading === index ? "Subiendo..." : "Cambiar"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Mobile Image */}
              <div>
                <label className="block text-sm text-[#262011]/70 mb-1">
                  Mobile (16:9, 1080x607)
                </label>
                <div className="relative aspect-[16/9] bg-gray-100 rounded overflow-hidden">
                  {slide.mobile ? (
                    <img
                      src={slide.mobile}
                      alt="Mobile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      Sin imagen
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(index, "mobile", e)}
                      className="hidden"
                      disabled={uploading === index}
                    />
                    <span className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                      {uploading === index ? "Subiendo..." : "Cambiar"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <input
              type="text"
              value={slide.alt || ""}
              onChange={(e) => handleAltChange(index, e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
              placeholder="Texto alternativo (alt)"
            />
          </div>
        ))}

        {localSlides.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No hay slides. Haz clic en "Agregar Slide" para comenzar.
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={() => onSave(localSlides)}
          disabled={saving}
          className="px-6 py-3 bg-[#262011] text-[#F5E1A4] rounded font-medium hover:bg-[#262011]/90 disabled:opacity-50 min-h-[48px]"
        >
          {saving ? "Guardando..." : "Guardar Slides"}
        </button>
      </div>
    </div>
  );
}

// ============ GALLERY EDITOR ============
function GalleryEditor({ images, onSave, saving }) {
  const [localImages, setLocalImages] = useState(images);
  const [uploading, setUploading] = useState(null);
  const [cropper, setCropper] = useState({
    isOpen: false,
    imageSrc: null,
    initialAspectRatio: 1,
    onComplete: null,
  });
  
  const [pendingFiles, setPendingFiles] = useState([]);
  const [processingQueue, setProcessingQueue] = useState(false);

  const MIN_IMAGES = 11;

  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  // Queue processing
  useEffect(() => {
    if (processingQueue && pendingFiles.length > 0 && !cropper.isOpen) {
      const file = pendingFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCropper({
          isOpen: true,
          imageSrc: reader.result,
          initialAspectRatio: 1,
          onComplete: (blob) => handleQueueUpload(blob),
        });
      };
      reader.readAsDataURL(file);
    } else if (processingQueue && pendingFiles.length === 0) {
      setProcessingQueue(false);
      setUploading(null);
    }
  }, [pendingFiles, processingQueue, cropper.isOpen]);

  async function uploadImage(file) {
    if (!CLOUDINARY_CLOUD_NAME) {
      throw new Error("Cloudinary no está configurado");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESETS.gallery);
    formData.append("folder", "gallery");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData },
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Error al subir imagen");
    }

    return await response.json();
  }

  async function handleQueueUpload(blob) {
    try {
      setUploading("queue");
      const file = new File([blob], "gallery-image.jpg", { type: "image/jpeg" });
      const result = await uploadImage(file);
      
      setLocalImages((prev) => [...prev, result.secure_url]);
    } catch (err) {
      alert(err.message);
    } finally {
      setPendingFiles((prev) => prev.slice(1));
      setCropper((prev) => ({ ...prev, isOpen: false }));
    }
  }

  function handleAddImages(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = "";
    setPendingFiles((prev) => [...prev, ...files]);
    setProcessingQueue(true);
  }

  function handleReplaceSelect(index, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = () => {
      setCropper({
        isOpen: true,
        imageSrc: reader.result,
        initialAspectRatio: 1,
        onComplete: (blob) => handleReplaceUpload(blob, index),
      });
    };
    reader.readAsDataURL(file);
  }

  async function handleReplaceUpload(blob, index) {
    try {
      setUploading(index);
      setCropper((prev) => ({ ...prev, isOpen: false }));
      
      const file = new File([blob], "gallery-image.jpg", { type: "image/jpeg" });
      const result = await uploadImage(file);
      
      setLocalImages((prev) => {
        const updated = [...prev];
        updated[index] = result.secure_url;
        return updated;
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(null);
    }
  }

  function removeImage(index) {
    const filledImages = localImages.filter(Boolean).length;
    if (filledImages <= MIN_IMAGES) {
      alert(`Debes mantener al menos ${MIN_IMAGES} imágenes en la galería`);
      return;
    }
    setLocalImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    const filledImages = localImages.filter(Boolean);
    if (filledImages.length < MIN_IMAGES) {
      alert(`Debes tener al menos ${MIN_IMAGES} imágenes en la galería`);
      return;
    }
    onSave(filledImages);
  }

  const displayImages = [...localImages];
  while (displayImages.length < MIN_IMAGES) {
    displayImages.push("");
  }

  const filledCount = localImages.filter(Boolean).length;

  return (
    <div className="space-y-6">
      <ImageCropperModal
        isOpen={cropper.isOpen}
        onClose={() => {
          setCropper((prev) => ({ ...prev, isOpen: false }));
          if (processingQueue) {
             setPendingFiles((prev) => prev.slice(1));
          }
        }}
        imageSrc={cropper.imageSrc}
        onCropComplete={cropper.onComplete}
        initialAspectRatio={cropper.initialAspectRatio}
      />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#262011]">
            Galería de Fotos
          </h3>
          <p className="text-sm text-[#262011]/60">
            Mínimo {MIN_IMAGES} imágenes cuadradas (1:1, 800x800). Actualmente:{" "}
            {filledCount}
          </p>
        </div>
        <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleAddImages}
            className="hidden"
            disabled={uploading === "queue" || processingQueue}
          />
          {uploading === "queue" || processingQueue ? "Procesando..." : "Agregar fotos"}
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {displayImages.map((img, index) => (
          <div
            key={index}
            className="relative aspect-square bg-gray-100 rounded overflow-hidden group"
          >
            {img ? (
              <>
                <img
                  src={img}
                  alt={`Galería ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                  title={
                    filledCount <= MIN_IMAGES
                      ? `Mínimo ${MIN_IMAGES} imágenes`
                      : "Eliminar"
                  }
                >
                  ×
                </button>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-200 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleReplaceSelect(index, e)}
                  className="hidden"
                  disabled={uploading === index}
                />
                {uploading === index ? (
                  <span className="text-gray-400 text-sm">Subiendo...</span>
                ) : (
                  <>
                    <span className="text-3xl text-gray-400">+</span>
                    <span className="text-gray-400 text-xs">{index + 1}</span>
                  </>
                )}
              </label>
            )}

            {img && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleReplaceSelect(index, e)}
                  className="hidden"
                  disabled={uploading === index}
                />
                <span className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                  {uploading === index ? "Subiendo..." : "Cambiar"}
                </span>
              </label>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving || filledCount < MIN_IMAGES}
          className="px-6 py-3 bg-[#262011] text-[#F5E1A4] rounded font-medium hover:bg-[#262011]/90 disabled:opacity-50 min-h-[48px]"
        >
          {saving ? "Guardando..." : "Guardar Galería"}
        </button>
      </div>
    </div>
  );
}

// ============ ABOUT/ELIGENOS EDITOR ============
function AboutEditor({ data, onSave, saving }) {
  const [localData, setLocalData] = useState({
    title: data.title || "",
    content: data.content || "",
    video: data.video || "",
  });
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    setLocalData({
      title: data.title || "",
      content: data.content || "",
      video: data.video || "",
    });
  }, [data]);

  async function uploadVideo(file) {
    if (!CLOUDINARY_CLOUD_NAME) {
      throw new Error("Cloudinary no está configurado");
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("El video no puede superar 10MB");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESETS.video);
    formData.append("folder", "videos");
    formData.append("resource_type", "video");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      { method: "POST", body: formData },
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Error al subir video");
    }

    return await response.json();
  }

  async function handleVideoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingVideo(true);
      const result = await uploadVideo(file);
      setLocalData((prev) => ({ ...prev, video: result.secure_url }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingVideo(false);
    }
  }

  function handleChange(field, value) {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  }

  // Simple formatting functions
  function execFormat(command) {
    document.execCommand(command, false, null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#262011]">
          Sección "Elígenos"
        </h3>
        <p className="text-sm text-[#262011]/60">
          Título, contenido y video de la sección Elígenos
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-[#262011]/80 mb-1">
          Título
        </label>
        <input
          type="text"
          value={localData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded text-base"
          placeholder="Ej: Elígenos"
        />
      </div>

      {/* Rich Text Content */}
      <div>
        <label className="block text-sm font-medium text-[#262011]/80 mb-1">
          Contenido
        </label>
        <div className="border border-gray-200 rounded overflow-hidden">
          {/* Formatting toolbar */}
          <div className="flex gap-1 p-2 bg-gray-50 border-b">
            <button
              type="button"
              onClick={() => execFormat("bold")}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 font-bold"
              title="Negrita"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => execFormat("italic")}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 italic"
              title="Cursiva"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => execFormat("underline")}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 underline"
              title="Subrayado"
            >
              U
            </button>
          </div>
          <div
            contentEditable
            className="min-h-[150px] p-4 focus:outline-none"
            dangerouslySetInnerHTML={{ __html: localData.content }}
            onBlur={(e) => handleChange("content", e.target.innerHTML)}
          />
        </div>
        <p className="text-xs text-[#262011]/50 mt-1">
          Puedes usar negritas, cursiva y subrayado. Los saltos de línea se
          respetarán.
        </p>
      </div>

      {/* Video */}
      <div>
        <label className="block text-sm font-medium text-[#262011]/80 mb-1">
          Video (max 30s, 10MB)
        </label>
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            {localData.video ? (
              <div className="relative">
                <video
                  src={localData.video}
                  controls
                  className="w-full max-w-md rounded"
                />
                <button
                  onClick={() => handleChange("video", "")}
                  className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-sm rounded"
                >
                  Eliminar
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  disabled={uploadingVideo}
                />
                {uploadingVideo ? (
                  <span className="text-gray-400">Subiendo video...</span>
                ) : (
                  <>
                    <span className="text-3xl text-gray-400 mb-2">▶</span>
                    <span className="text-gray-400 text-sm">Subir video</span>
                  </>
                )}
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={() => onSave(localData)}
          disabled={saving || uploadingVideo}
          className="px-6 py-3 bg-[#262011] text-[#F5E1A4] rounded font-medium hover:bg-[#262011]/90 disabled:opacity-50 min-h-[48px]"
        >
          {saving ? "Guardando..." : "Guardar Sección"}
        </button>
      </div>
    </div>
  );
}

// ============ FOOTER EDITOR ============
function FooterEditor({ data, onSave, saving }) {
  const [localData, setLocalData] = useState({
    address: data.address || "",
    addressUrl: data.addressUrl || "",
    phone: data.phone || "",
    phoneUrl: data.phoneUrl || "",
    email: data.email || "",
    instagram: data.instagram || "",
    instagramUrl: data.instagramUrl || "",
  });

  useEffect(() => {
    setLocalData({
      address: data.address || "",
      addressUrl: data.addressUrl || "",
      phone: data.phone || "",
      phoneUrl: data.phoneUrl || "",
      email: data.email || "",
      instagram: data.instagram || "",
      instagramUrl: data.instagramUrl || "",
    });
  }, [data]);

  function handleChange(field, value) {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  }

  // Auto-generate URLs when appropriate
  function handlePhoneChange(value) {
    handleChange("phone", value);
    // Auto-generate WhatsApp URL if it looks like a Chilean number
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 9) {
      handleChange(
        "phoneUrl",
        `https://wa.me/${cleaned.startsWith("56") ? cleaned : "56" + cleaned}`,
      );
    }
  }

  function handleInstagramChange(value) {
    handleChange("instagram", value);
    // Auto-generate Instagram URL
    const handle = value.replace("@", "").trim();
    if (handle) {
      handleChange("instagramUrl", `https://instagram.com/${handle}`);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#262011]">
          Información del Footer
        </h3>
        <p className="text-sm text-[#262011]/60">
          Datos de contacto que aparecen en el pie de página
        </p>
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#262011]/80 mb-1">
            Dirección
          </label>
          <input
            type="text"
            value={localData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded text-base"
            placeholder="Av. Ejemplo 1234, Santiago"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#262011]/80 mb-1">
            URL Google Maps
          </label>
          <input
            type="url"
            value={localData.addressUrl}
            onChange={(e) => handleChange("addressUrl", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded text-base"
            placeholder="https://maps.google.com/..."
          />
        </div>
      </div>

      {/* Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#262011]/80 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            value={localData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded text-base"
            placeholder="+56 9 1234 5678"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#262011]/80 mb-1">
            URL WhatsApp
          </label>
          <input
            type="url"
            value={localData.phoneUrl}
            onChange={(e) => handleChange("phoneUrl", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded text-base"
            placeholder="https://wa.me/56912345678"
          />
          <p className="text-xs text-[#262011]/50 mt-1">
            Se genera automáticamente
          </p>
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-[#262011]/80 mb-1">
          Email
        </label>
        <input
          type="email"
          value={localData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded text-base"
          placeholder="contacto@lapancomido.cl"
        />
        <p className="text-xs text-[#262011]/50 mt-1">
          El enlace mailto: se genera automáticamente
        </p>
      </div>

      {/* Instagram */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#262011]/80 mb-1">
            Instagram
          </label>
          <input
            type="text"
            value={localData.instagram}
            onChange={(e) => handleInstagramChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded text-base"
            placeholder="@lapancomido"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#262011]/80 mb-1">
            URL Instagram
          </label>
          <input
            type="url"
            value={localData.instagramUrl}
            onChange={(e) => handleChange("instagramUrl", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded text-base"
            placeholder="https://instagram.com/lapancomido"
          />
          <p className="text-xs text-[#262011]/50 mt-1">
            Se genera automáticamente
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={() => onSave(localData)}
          disabled={saving}
          className="px-6 py-3 bg-[#262011] text-[#F5E1A4] rounded font-medium hover:bg-[#262011]/90 disabled:opacity-50 min-h-[48px]"
        >
          {saving ? "Guardando..." : "Guardar Footer"}
        </button>
      </div>
    </div>
  );
}
