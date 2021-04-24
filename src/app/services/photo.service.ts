import { Injectable } from '@angular/core';
import {
  Plugins, CameraResultType, Capacitor, FilesystemDirectory,
  CameraPhoto, CameraSource
} from '@capacitor/core';

const { Camera, FileSystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: Photo[] = [];


  constructor() { }


  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const saveImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(saveImageFile);
  }


  private async savePicture(cameraPhoto: CameraPhoto) {

    const base64 = await this.readAsBase64(cameraPhoto);

    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await FileSystem.writeFile({
      path: fileName,
      data: base64,
      directory: FilesystemDirectory.Data
    });

    return ({
      filePath: fileName,
      webViewPath: cameraPhoto.webPath
    })

  }



  /* 
   *  Helper Functions.
   */
  private async readAsBase64(cameraPhoto: CameraPhoto) {
    const response = await fetch(cameraPhoto.webPath);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader;

      reader.onerror = reject;

      reader.onload = () => {
        resolve(reader.result);
      }
      reader.readAsDataURL(blob)
    })
  }
}


export interface Photo {
  filePath: string;
  webViewPath: string;
}