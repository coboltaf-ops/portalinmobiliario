'use client'

import { useState, useEffect } from 'react'

interface PDFPreviewProps {
  isOpen: boolean
  onClose: () => void
  pdfBlob: Blob
  fileName: string
  onDownload?: () => void
}

export function PDFPreview({ isOpen, onClose, pdfBlob, fileName, onDownload }: PDFPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('')

  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [pdfBlob])

  if (!isOpen) return null

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    onDownload?.()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Vista Previa del PDF</h2>
            <p className="text-sm text-gray-500 mt-1">{fileName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="bg-white rounded-lg shadow">
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-lg"
              style={{ minHeight: '600px' }}
            />
          </div>
        </div>

        <div className="flex gap-4 p-6 border-t border-gray-200 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-semibold bg-gray-200 text-gray-900 hover:bg-gray-300 transition-all"
          >
            Cerrar
          </button>
          <button
            onClick={handleDownload}
            className="px-6 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar
          </button>
        </div>
      </div>
    </div>
  )
}
