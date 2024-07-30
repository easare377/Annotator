import {Component, Input, OnInit} from '@angular/core';
import {ImageInfoBase} from "../../../models/image-info-base";
import {ImageInfoViewModel} from "../../../models/image-info-view-model";
import {NavigationService} from "../../../services/navigation.service";
import {HttpService} from "../../../services/http.service";
import {AppManagerService} from "../../../services/app-manager.service";

@Component({
  selector: 'app-image-data-table',
  templateUrl: './image-data-table.component.html',
  styleUrl: './image-data-table.component.css'
})
export class ImageDataTableComponent implements OnInit{

  @Input() projectId!: string;

  @Input() imageInfoVms!: ImageInfoViewModel[];

  constructor(public navService: NavigationService, private httpService: HttpService,
              protected appManagerService: AppManagerService) {

  }

  ngOnInit(): void {

  }
}
