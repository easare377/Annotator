import { Component,Output,OnInit,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent implements OnInit {

  // @Output() eventClicked = new EventEmitter<MouseEvent>();
  // @Output() eventClicked: EventEmitter<any> = new EventEmitter();
  @Output() requestEvent = new EventEmitter<void>();

  ngOnInit(): void {
      
  }
  // handleClick(event:MouseEvent){

  //   this.eventClicked.emit(true);
  // }
  click1() {
    this.requestEvent.emit();
    
  }

}
