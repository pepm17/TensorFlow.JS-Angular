import { Component, OnInit } from '@angular/core';

//import COCO-SSD model as cocoSSD
import * as cocoSSD from '@tensorflow-models/coco-ssd';
import { SpeechSynthesisUtteranceFactoryService, SpeechSynthesisService } from '@kamiazya/ngx-speech-synthesis';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  title = 'TF-ObjectDetection';
  private video: HTMLVideoElement;

  constructor(
    public f: SpeechSynthesisUtteranceFactoryService,
    public svc: SpeechSynthesisService,
  ) { }
  
  
  ngOnInit(){ 
    this.webcam_init();
    this.predictWithCocoModel();
  }

  public async predictWithCocoModel(){
    const model = await cocoSSD.load({base: 'mobilenet_v2'});
    this.detectFrame(this.video,model);
    console.log('model loaded');
  }

  webcam_init(){  
    this.video = <HTMLVideoElement> document.getElementById("vid");
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
      facingMode: "user",
      }
    }).then(stream => {
        this.video.srcObject = stream;
        this.video.onloadedmetadata = () => {
        this.video.play();
        };
      });
  }
    
  detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      this.renderPredictions(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(video, model);
      });
    });
  }

  renderPredictions = predictions => {
    const canvas = <HTMLCanvasElement> document.getElementById("canvas");  
    const ctx = canvas.getContext("2d");
    const input = <HTMLInputElement> document.getElementById("busquedaObjeto");
    console.log(input.value);

    canvas.width  = 300;
    canvas.height = 300;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.drawImage(this.video,0, 0,300,300);

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      if(input.value!=""){
        if(input.value == prediction.class){
          // Draw the bounding box.
          ctx.strokeStyle = "#00FFFF";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
          // Draw the label background.
          ctx.fillStyle = "#00FFFF";
          const textWidth = ctx.measureText(prediction.class).width;
          const textHeight = parseInt(font, 10); // base 10
          ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
          
          // Draw the text last to ensure it's on top.
          ctx.fillStyle = "#000000";
          ctx.fillText(prediction.class, x, y);
        }
      }else{
         // Draw the bounding box.
         ctx.strokeStyle = "#00FFFF";
         ctx.lineWidth = 2;
         ctx.strokeRect(x, y, width, height);
         // Draw the label background.
         ctx.fillStyle = "#00FFFF";
         const textWidth = ctx.measureText(prediction.class).width;
         const textHeight = parseInt(font, 10); // base 10
         ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
         
         // Draw the text last to ensure it's on top.
         ctx.fillStyle = "#000000";
         ctx.fillText(prediction.class, x, y);
      }
      
      
    });
    /*
    predictions.forEach(prediction => {
      const v = this.f.text(prediction.class);
      this.svc.speak(v);
    });*/

    
  };
}