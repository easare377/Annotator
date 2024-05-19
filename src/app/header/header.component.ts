// import { Component,ElementRef, ViewChild} from '@angular/core';

// @Component({
//   selector: 'headerComponent',
//   templateUrl: './header.component.html',
//   styleUrl: './header.component.css'
// })


// export class HeaderComponent {
//   list:string[]=["kishoe","koushik"]
//   title = 'my-app';
//   search:string="";
//   showlist:boolean
//   imagePath:string
//   drag:boolean=false

//   constructor(){
//     this.showlist=false  
//     this.imagePath='./assets/images/image (1).jpeg '
//   }

// //   searchText(event:any){
// //     this.search=event.target.value
    

// //   }
    
//     onSave(event:any){
//         console.log(event)
//     }
//     showist(value:boolean){

//         this.showlist=value
//         console.log(this.showlist)
//     }
//     mouseevnet(type:string){
//         if(type="up"){
//             this.drag=false
//             console.log('mouse'+ type)
//         }
//         if(type="down"){

//             this.drag=true
//             console.log('mouse'+ type)
//         }
//         if(type="move"){
//             this.dragEvent
//             console.log('mouse'+ type)
//         }
//         if(type="enter"){
//             console.log('mouse'+ type)
//         }
//         if(type="leave"){
//             console.log('mouse'+ type)
//         }

//     }
//     dragEvent(){
//         if(this.drag){
//             console.log("mouse dragged")
//         }

//     }
    
// }
import { Component, ElementRef, ViewChild,AfterViewInit  } from '@angular/core';

@Component({
  selector: 'headerComponent',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.html']
})
export class HeaderComponent {
  

  @ViewChild('imageCanvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('uploadedImage', { static: false }) imageElement!: ElementRef<HTMLImageElement>;
  
  public imageSrc: string | ArrayBuffer | null;

  constructor() {
    this.imageSrc = null;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files) {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => this.imageSrc = (e.target as FileReader).result;
        reader.readAsDataURL(file);
      }
    }
  }

  onImageLoad(): void {
    const img = this.imageElement.nativeElement;
    const canvas = this.canvas.nativeElement;
    canvas.width = img.width;
    canvas.height = img.height;
    this.drawImageOnCanvas(img);
  }

  drawImageOnCanvas(img: HTMLImageElement): void {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
    }
  }

  // Additional methods to handle drawing on the canvas will go here
}
