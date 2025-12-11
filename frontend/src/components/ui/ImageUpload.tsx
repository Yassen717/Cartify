import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import { Button } from './Button';
import './ImageUpload.css';

interface ImageUploadProps {
    onUpload: (files: File[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
    accept?: string;
    multiple?: boolean;
    preview?: boolean;
}

export const ImageUpload = ({
    onUpload,
    maxFiles = 5,
    maxSizeMB = 5,
    accept = 'image/*',
    multiple = true,
    preview = true,
}: ImageUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            handleFiles(files);
        }
    };

    const handleFiles = (files: File[]) => {
        // Filter  for valid image files
        const validFiles = files.filter((file) => {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file`);
                return false;
            }

            const sizeMB = file.size / (1024 * 1024);
            if (sizeMB > maxSizeMB) {
                alert(`${file.name} is too large. Max size is ${maxSizeMB}MB`);
                return false;
            }

            return true;
        });

        // Limit number of files
        const filesToAdd = validFiles.slice(0, maxFiles - selectedFiles.length);

        if (filesToAdd.length < validFiles.length) {
            alert(`Maximum ${maxFiles} files allowed`);
        }

        // Update selected files
        const newFiles = [...selectedFiles, ...filesToAdd];
        setSelectedFiles(newFiles);

        // Generate preview URLs
        if (preview) {
            const newPreviewUrls = filesToAdd.map((file) => URL.createObjectURL(file));
            setPreviewUrls([...previewUrls, ...newPreviewUrls]);
        }

        // Call parent handler
        onUpload(newFiles);
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviewUrls = previewUrls.filter((_, i) => i !== index);

        // Revoke old URL to prevent memory leaks
        if (previewUrls[index]) {
            URL.revokeObjectURL(previewUrls[index]);
        }

        setSelectedFiles(newFiles);
        setPreviewUrls(newPreviewUrls);
        onUpload(newFiles);
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="image-upload">
            <div
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <FiUpload className="upload-icon" />
                <h4>Drag and drop images here</h4>
                <p>or</p>
                <Button type="button" variant="outline" onClick={handleBrowseClick}>
                    Browse Files
                </Button>
                <p className="upload-hint">
                    Maximum {maxFiles} images, up to {maxSizeMB}MB each
                </p>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
            </div>

            {selectedFiles.length > 0 && (
                <div className="selected-files">
                    <h4>Selected Images ({selectedFiles.length})</h4>
                    <div className="files-grid">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="file-item">
                                {preview && previewUrls[index] ? (
                                    <img
                                        src={previewUrls[index]}
                                        alt={file.name}
                                        className="file-preview"
                                    />
                                ) : (
                                    <div className="file-placeholder">
                                        <FiImage />
                                    </div>
                                )}
                                <div className="file-info">
                                    <p className="file-name">{file.name}</p>
                                    <p className="file-size">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="remove-file"
                                    onClick={() => removeFile(index)}
                                    aria-label="Remove file"
                                >
                                    <FiX />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
