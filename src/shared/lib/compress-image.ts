/**
 * Compresses an image file to a target max width/height and quality.
 * Returns a Base64 data URL.
 */
export function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Solo se permiten imagenes.'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Error al leer la imagen.'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Error al procesar la imagen.'))
      img.onload = () => {
        let { width, height } = img

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Error al crear canvas.')); return }

        ctx.drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/jpeg', quality)
        resolve(compressed)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}
