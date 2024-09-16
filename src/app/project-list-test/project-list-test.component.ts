
import { Component,AfterViewInit } from '@angular/core';
interface ImageData {
  filename: string;
  url: string;
}

@Component({
  selector: 'app-project-list-test',  // Component's selector (tag name)
  templateUrl: './project-list-test.component.html',  // HTML template path
  styleUrls: ['./project-list-test.component.css']    // Stylesheet path
})

export class ProjectListTestComponent  {
  // Component logic here
  projectName = 'coinpotatoes';
  selectedImages: any[] = [];


  images = [
    { name: 'Potato_1.jpg', url: 'assets/potato_1.jpg', status: '' },
    { name: 'Potato_2.jpg', url: 'assets/potato_2.jpg', status: '' },
    { name: 'Potato_3.jpg', url: 'assets/potato_3.jpg', status: 'warning' },
    { name: 'Potato_4.jpg', url: 'assets/potato_4.jpg', status: 'selected' },
    // More image objects
  ];

  toggleImageSelection(image: any) {
    if (image.status === 'selected') {
      image.status = '';
      this.selectedImages = this.selectedImages.filter(img => img !== image);
    } else {
      image.status = 'selected';
      this.selectedImages.push(image);
    }
  }


  toggleSidebar() {
    const sidebar = document.querySelector('#sidebar');
    if (sidebar) {
      sidebar.classList.toggle('expand');
    }
  }
}