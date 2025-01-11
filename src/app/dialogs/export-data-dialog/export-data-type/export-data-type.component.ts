import {Component, Input, OnInit, Output} from '@angular/core';
import {HttpService} from "../../../../services/http.service";

@Component({
  selector: 'app-export-data-type',
  templateUrl: './export-data-type.component.html',
  styleUrl: './export-data-type.component.css'
})
export class ExportDataTypeComponent{
  @Input() typeText!: string;
  @Input() typeDescription!: string;
  @Output() checked: boolean = false;
}
