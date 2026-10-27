(function(root){
  'use strict';
  const messages={
    dark:['사진이 어두워요. 창문을 바라보고 다시 찍어 주세요.','Too dark. Face a window and retake.'],
    small:['얼굴이 너무 작아요. 화면 가까이 와 주세요.','Your face is too small. Move closer.'],
    side:['얼굴을 정면으로 돌려 주세요.','Look straight at the camera.'],
    resolution:['짧은 변이 480픽셀 이상인 사진을 골라 주세요.','Choose an image at least 480 pixels on its short side.'],
    format:['10MB 미만의 JPG 또는 PNG 사진을 골라 주세요.','Choose a JPG or PNG under 10 MB.'],
    noface:['얼굴을 찾지 못했어요. 얼굴 전체가 나오게 다시 찍어 주세요.','No face found. Keep your whole face in the frame.'],
    corrupt:['사진을 열 수 없어요. 다른 사진을 골라 주세요.','This image could not be opened. Choose another photo.']
  };
  function inspectPixels({width,height,brightness,faceRatio,frontal}){
    if(Math.min(width,height)<480)return 'resolution';
    if(brightness<55)return 'dark';
    if(faceRatio!==undefined&&faceRatio<=.6)return 'small';
    if(frontal===false)return 'side';
    return '';
  }
  async function check(blob){
    if(!['image/jpeg','image/png'].includes(blob.type)||blob.size>=10*1024*1024)return {ok:false,code:'format'};
    let img,url;
    try{
      url=URL.createObjectURL(blob);img=new Image();img.src=url;await img.decode();
      const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,64,64);
      const pixels=ctx.getImageData(0,0,64,64).data;let total=0;
      for(let i=0;i<pixels.length;i+=4)total+=pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722;
      const values={width:img.naturalWidth,height:img.naturalHeight,brightness:total/(64*64)};
      let manual=true;
      if('FaceDetector' in root){
        try{const faces=await new root.FaceDetector({fastMode:true,maxDetectedFaces:2}).detect(img);
          if(faces.length!==1)return {ok:false,code:'noface'};
          values.faceRatio=faces[0].boundingBox.width/img.naturalWidth;
          // FaceDetector does not expose reliable yaw. Pose always requires confirmation.
        }catch{/* Detector availability varies; explicit manual confirmation remains. */}
      }
      const code=inspectPixels(values);return {ok:!code,code,manual,brightness:Math.round(values.brightness)};
    }catch{return {ok:false,code:'corrupt'};}finally{if(url)URL.revokeObjectURL(url);}
  }
  root.CartPrecheck={check,inspectPixels,messages};
})(globalThis);
