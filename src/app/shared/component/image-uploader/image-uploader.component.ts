import {Component, ElementRef, inject, Input, ViewChild} from "@angular/core";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzMessageService} from "ng-zorro-antd/message";

@Component({
  selector: 'image-uploader',
  imports: [NzButtonModule],
  standalone: true,
  templateUrl: './image-uploader.component.html',
})
export class ImageUploaderComponent {
  @Input() acceptedFormats: string[] = ['.jpg', '.png', '.jpeg'];
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  selectedFile: File | null = null;
  selectedFileUrl: string | null = null;
  private readonly nzMessageService = inject(NzMessageService);
  uploadProgress = 0;

  onClick() {
    this.fileInput.nativeElement.click();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (this.acceptedFormats.some(format => file.name.endsWith(format))) {
        this.startProgress();
        this.selectedFile = file;
        this.selectedFileUrl = URL.createObjectURL(this.selectedFile);
      } else {
        this.nzMessageService.error('فرمت فایل نامعتبر است');
      }
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.startProgress();
      const file = input.files[0];
      if (this.acceptedFormats.some(format => file.name.endsWith(format))) {
        this.selectedFile = file;
        this.selectedFileUrl = URL.createObjectURL(this.selectedFile);
      } else {
        this.nzMessageService.error('فرمت فایل نامعتبر است');
      }
    }
  }

  startProgress() {
    this.uploadProgress = 0;
    const interval = setInterval(() => {
      this.uploadProgress += 1;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
      }
    }, 20);
  }

  removeFile() {
    this.selectedFile = null;
    this.selectedFileUrl = null;
  }
}
