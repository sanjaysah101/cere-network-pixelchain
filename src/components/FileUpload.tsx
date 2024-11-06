'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import useFileUpload from '../hooks/useFileUpload';

export function FileUpload() {
  const { handleFileChange, isUploading, files, removeFile, handleUpload } =
    useFileUpload();

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex flex-col items-center gap-4">
        <label
          htmlFor="file-upload"
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary cursor-pointer transition-colors"
        >
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-600">
              Drop your .heic files here or click to browse
            </p>
          </div>
          <Input
            id="file-upload"
            type="file"
            accept=".heic"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>

        {files.length > 0 && (
          <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="relative aspect-square rounded-lg overflow-hidden border"
              >
                <Image
                  src={file.preview}
                  alt={file.file.name}
                  fill
                  className="object-cover"
                  unoptimized
                  loader={({ src }) => src}
                />
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
          className="w-full max-w-xs"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Files'
          )}
        </Button>
      </div>
    </div>
  );
}
