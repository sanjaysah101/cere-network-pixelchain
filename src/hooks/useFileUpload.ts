'use client';

import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { uploadToDdc } from '@/actions/fileUpload';

interface FileWithPreview {
  id: string;
  file: File;
  preview: string;
  url?: string; // DDC URL
}

export default function useFileUpload() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const convertHeicToJpeg = async (file: File): Promise<string> => {
    try {
      const heic2any = (await import('heic2any')).default;
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9,
      });

      const jpeg = Array.isArray(convertedBlob)
        ? convertedBlob[0]
        : convertedBlob;
      return URL.createObjectURL(jpeg);
    } catch (error) {
      console.error('Error converting HEIC:', error);
      throw error;
    }
  };

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        // Convert file to buffer
        const arrayBuffer = await file.file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to DDC
        const result = await uploadToDdc(buffer);
        return {
          ...file,
          url: result.url,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      toast({
        title: 'Success',
        description: 'Files uploaded successfully to Cere DDC',
      });

      // Clean up previews and update state with DDC URLs
      files.forEach((file) => URL.revokeObjectURL(file.preview));
      setFiles(uploadedFiles);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload files to Cere DDC',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [files, toast]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;

      if (!selectedFiles) return;

      // Validate file types
      const invalidFiles = Array.from(selectedFiles).filter(
        (file) => !file.name.toLowerCase().endsWith('.heic')
      );

      if (invalidFiles.length > 0) {
        toast({
          title: 'Invalid file type',
          description: 'Please select only .heic files',
          variant: 'destructive',
        });
        return;
      }

      try {
        // Convert and create previews for all files
        const newFiles = await Promise.all(
          Array.from(selectedFiles).map(async (file) => {
            const preview = await convertHeicToJpeg(file);
            return {
              id: crypto.randomUUID(),
              file,
              preview,
            };
          })
        );

        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      } catch (error) {
        console.error('File processing error:', error);
        toast({
          title: 'Error',
          description: 'Failed to process HEIC files',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prevFiles) => {
      const fileToRemove = prevFiles.find((file) => file.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prevFiles.filter((file) => file.id !== id);
    });
  }, []);

  // Clean up previews when component unmounts
  useCallback(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  return {
    files,
    isUploading,
    handleFileChange,
    removeFile,
    handleUpload,
  };
}
