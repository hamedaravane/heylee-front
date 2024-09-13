import {Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild} from "@angular/core";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzMessageService} from "ng-zorro-antd/message";
import {NzBytesPipe} from "ng-zorro-antd/pipes";

@Component({
  selector: 'image-uploader',
  imports: [NzButtonModule, NzBytesPipe],
  standalone: true,
  templateUrl: './image-uploader.component.html',
})
export class ImageUploaderComponent {
  @Input() acceptedFormats: string[] = ['.jpg', '.png', '.jpeg'];
  @Output() onFileSelected = new EventEmitter<File | null>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  selectedFile: File | null = null;
  selectedFileUrl: string | null = null;
  uploadProgress = 0;
  private readonly nzMessageService = inject(NzMessageService);

  onClick() {
    this.fileInput.nativeElement.click();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.assignFile(event.dataTransfer.files[0]);
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.assignFile(input.files[0]);
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.selectedFileUrl = null;
    this.onFileSelected.emit(null);
  }

  private startProgress() {
    this.uploadProgress = 0;
    const interval = setInterval(() => {
      this.uploadProgress += 1;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
      }
    }, 20);
  }

  private assignFile(file: File) {
    if (this.acceptedFormats.some(format => file.name.endsWith(format))) {
      this.startProgress();
      this.selectedFile = file;
      this.onFileSelected.emit(file);
      this.selectedFileUrl = URL.createObjectURL(this.selectedFile);
    } else {
      this.nzMessageService.error('فرمت فایل نامعتبر است');
    }
  }
}
