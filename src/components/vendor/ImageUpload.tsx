
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash2, Loader2, Images } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ value, onChange, maxImages = 5 }: ImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (value.length + files.length > maxImages) {
      toast({
        title: 'Maximum Images Reached',
        description: `You can only upload up to ${maxImages} images.`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    // In a real app, you would upload these files to a server
    // Here we'll just convert them to data URLs for demo purposes
    const newImages: string[] = [];

    const processFiles = async () => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid File Type',
            description: 'Please upload only image files.',
            variant: 'destructive',
          });
          continue;
        }

        try {
          const dataUrl = await readFileAsDataURL(file);
          newImages.push(dataUrl);
        } catch (error) {
          console.error('Error reading file:', error);
        }
      }

      // Add the new images to the existing ones
      onChange([...value, ...newImages]);
      setIsUploading(false);
    };

    processFiles();
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...value];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {value.map((image, index) => (
          <div 
            key={index} 
            className="relative aspect-square rounded-md overflow-hidden border border-gray-200 group"
          >
            <img 
              src={image} 
              alt={`Service image ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => removeImage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {value.length < maxImages && (
          <div className="aspect-square flex items-center justify-center border border-dashed border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-center">
                  <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
                  <span className="text-sm text-gray-500">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <ImagePlus className="h-10 w-10 text-gray-400" />
                  <span className="text-sm text-gray-500">Click to upload</span>
                </div>
              )}
            </label>
          </div>
        )}
      </div>

      {value.length === 0 && !isUploading && (
        <div className="border border-dashed border-gray-300 rounded-md p-8 bg-gray-50">
          <div className="flex flex-col items-center gap-2 text-center">
            <Images className="h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">No images uploaded</h3>
            <p className="text-sm text-gray-500">
              Upload high-quality images to showcase your services
            </p>
            <label className="cursor-pointer mt-2">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading}
              />
              <Button 
                className="bg-kasadya-purple hover:bg-kasadya-deep-purple"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Upload Images
                  </>
                )}
              </Button>
            </label>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        {value.length} of {maxImages} images uploaded
      </p>
    </div>
  );
}
