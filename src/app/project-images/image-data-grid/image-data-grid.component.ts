import {Component, Input, OnInit,OnChanges,SimpleChanges} from '@angular/core';
import {ImageInfoBase} from "../../../models/image-info-base";
import {ImageInfoViewModel} from "../../../models/image-info-view-model";
import {NavigationService} from "../../../services/navigation.service";
import {HttpService} from "../../../services/http.service";
import {AppManagerService} from "../../../services/app-manager.service";
interface ImageData {
  filename: string;
  url: string;
}

@Component({
  selector: 'app-image-data-grid',
  templateUrl: './image-data-grid.component.html',
  styleUrl: './image-data-grid.component.css'
})
export class ImageDataGridComponent implements OnChanges  {

  @Input() projectId!: string;

  @Input() imageInfoVms!: ImageInfoViewModel[];

  constructor(public navService: NavigationService, private httpService: HttpService,
              protected appManagerService: AppManagerService) {

  }
  ngOnInit(): void {
    console.log("hiiiiiii" + this.imageInfoVms +"hi");

  }
  

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageInfoVms']) {
      console.log('Grid received imageInfoVms:', this.imageInfoVms);
    }
  }

  projectName = 'coinpotatoes';
  selectedImages: any[] = [];


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
