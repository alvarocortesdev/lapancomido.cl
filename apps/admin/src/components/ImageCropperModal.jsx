import React, { useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../utils/cropUtils'

const ASPECT_RATIOS = [
  { label: '1:1 (Cuadrado)', value: 1 / 1 },
  { label: '21:9 (Ultrawide)', value: 21 / 9 },
  { label: '16:9 (Widescreen)', value: 16 / 9 },
]

const ImageCropperModal = ({ isOpen, onClose, imageSrc, onCropComplete, initialAspectRatio = 1 }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState(initialAspectRatio)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isCropping, setIsCropping] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setAspect(initialAspectRatio)
      setZoom(1)
      setCrop({ x: 0, y: 0 })
    }
  }, [isOpen, initialAspectRatio])

  const onCropChange = (crop) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom) => {
    setZoom(zoom)
  }

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    try {
      setIsCropping(true)
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(croppedImageBlob)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setIsCropping(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-4xl rounded-lg bg-white overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Editar Imagen</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Body - Cropper */}
        <div className="relative flex-1 bg-gray-900 min-h-[400px]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteHandler}
          />
        </div>

        {/* Controls */}
        <div className="border-t bg-gray-50 px-6 py-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            {/* Aspect Ratio Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Formato:</span>
              <div className="flex gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.label}
                    onClick={() => setAspect(ratio.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      Math.abs(aspect - ratio.value) < 0.01
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-700">Zoom:</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full sm:w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isCropping}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCropping ? 'Procesando...' : 'Usar Recorte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageCropperModal
