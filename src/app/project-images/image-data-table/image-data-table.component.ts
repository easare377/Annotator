import {Component, Input, OnInit} from '@angular/core';
import {ImageInfoBase} from "../../../models/image-info-base";
import {ImageInfoViewModel} from "../../../models/image-info-view-model";
import {NavigationService} from "../../../services/navigation.service";
import {HttpService} from "../../../services/http.service";
import {AppManagerService} from "../../../services/app-manager.service";
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component'; 



@Component({
  selector: 'app-image-data-table',
  templateUrl: './image-data-table.component.html',
  styleUrls: ['./image-data-table.component.css']
})


export class ImageDataTableComponent implements OnInit {
  @Input() projectId!: string;
  @Input() imageInfoVms!: ImageInfoViewModel[];

  constructor(
    public navService: NavigationService,
    private httpService: HttpService,
    protected appManagerService: AppManagerService,
    private dialog: MatDialog 
  ) {}

  ngOnInit(): void {}
  onRowClick(projectId: string, imageId: string, event: Event) {
    // Only navigate if the event was not triggered by the remove button
    console.log('Navigating to annotate image', projectId, imageId);
    this.navService.gotoAnnotateImagesAsync(projectId, imageId);
  }

  deleteImage(projectId: string, imageId: string, event: Event) {
    event.stopPropagation(); // Prevent row click event

    // Open the confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // User confirmed, proceed with deleting the image
        this.httpService.deleteImageAsync(projectId, imageId).then(response => {
          console.log('Image deleted:', response);
          // Remove deleted image from imageInfoVms array
          this.imageInfoVms = this.imageInfoVms.filter(image => image.imageId !== imageId);
        }).catch(error => {
          console.error('Error deleting image:', error);
        });
      } else {
        // User canceled, do nothing
        console.log('Image deletion canceled');
      }
    });
  }
}

