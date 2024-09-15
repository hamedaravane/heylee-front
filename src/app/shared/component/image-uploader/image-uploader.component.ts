import {Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild} from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzBytesPipe} from 'ng-zorro-antd/pipes';

@Component({
  selector: 'image-uploader',
  imports: [NzButtonModule, NzBytesPipe],
  standalone: true,
  templateUrl: './image-uploader.component.html'
})
export class ImageUploaderComponent {
  private readonly nzMessageService = inject(NzMessageService);
  @Input() acceptedFormats: string[] = ['.jpg', '.png', '.jpeg'];
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Input() isMultiple: boolean = false;
  @Output() onFileSelected = new EventEmitter<File | null>();
  @Output() onMultipleFileSelected = new EventEmitter<File[] | null>();
  selectedFile: File | null = null;
  selectedFileUrl: string | null = null;
  uploadProgress = 0;

  private assignFile(file: File) {
    if (this.isAcceptedFormats(file)) {
      this.startProgress();
      this.selectedFile = file;
      this.onFileSelected.emit(file);
      this.selectedFileUrl = URL.createObjectURL(this.selectedFile);
    } else this.nzMessageService.error('فرمت فایل درست نیست');
  }

  private assignMultipleFiles(files: FileList) {
    if (this.isAcceptedFormats(files)) {
      this.onMultipleFileSelected.emit(this.extractFileOfFileList(files));
    } else this.nzMessageService.error('فرمت فایل ها درست نیست');
  }

  private extractFileOfFileList(fileList: FileList) {
    const fileArray: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      if (fileList.item(i)) {
        fileArray.push(fileList.item(i)!);
      }
    }
    return fileArray;
  }

  private isAcceptedFormats(file: File | FileList) {
    if (file instanceof FileList) {
      const files = this.extractFileOfFileList(file);
      return files.filter(f => this.acceptedFormats.some(format => f.name.endsWith(format))).length === file.length;
    } else {
      return this.acceptedFormats.some(format => file.name.endsWith(format));
    }
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

  onClick() {
    this.fileInput.nativeElement.click();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (this.isMultiple) {
      const files = event.dataTransfer?.files;
      if (files) {
        this.assignMultipleFiles(files);
      }
    }
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.assignFile(event.dataTransfer.files[0]);
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (this.isMultiple) {
      const files = input.files;
      if (files) {
        this.assignMultipleFiles(files);
      }
    }
    if (input.files && input.files.length > 0) {
      this.assignFile(input.files[0]);
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.selectedFileUrl = null;
    this.onFileSelected.emit(null);
  }
}
