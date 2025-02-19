import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FileAttachment } from '../model/file-attachment.model';

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  constructor(private http: HttpClient) {}

  upload(file: FormData, senderId: number, receiverId: number) {
    return this.http.post<FileAttachment>(
      `/api/messages/upload?senderId=${senderId}&receiverId=${receiverId}`,
      file,
      {
        reportProgress: true,
        observe: 'events'
      }
    );
  }
}