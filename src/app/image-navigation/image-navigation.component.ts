import {Component, Input, OnInit} from '@angular/core';
import {ImageInfoViewModel} from "../../models/image-info-view-model";
import {ObjectClassViewModel} from "../../models/object-class-view-model";

@Component({
  selector: 'app-image-navigation',
  templateUrl: './image-navigation.component.html',
  styleUrl: './image-navigation.component.css'
})
export class ImageNavigationComponent implements OnInit{
  @Input() imageInfo!: ImageInfoViewModel;
  @Input() active: Boolean = false;
  ngOnInit(): void {
  }
}
