import { FileUploader } from "@/components/layout/file-uploader";

export function FileUploaderDemo() {
  return (
    <div className="w-full">
      <FileUploader
        accept={{
          "application/pdf": [],
          "image/*": [],
        }}
        maxFileCount={3}
        maxSize={1024 * 1024 * 5}
        multiple
      />
    </div>
  );
}
