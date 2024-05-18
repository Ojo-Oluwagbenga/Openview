
let instance = 1
let toload = []
let model = '../static/locals/recognition/models'
if (this.models_loaded_sub){
    toload = [
        faceapi.nets.faceRecognitionNet.loadFromUri(model),
        faceapi.nets.faceLandmark68Net.loadFromUri(model),
    ]
}else{
    toload = [
        faceapi.nets.tinyFaceDetector.loadFromUri(model),
        faceapi.nets.ssdMobilenetv1.loadFromUri(model),
        faceapi.nets.faceRecognitionNet.loadFromUri(model),
        faceapi.nets.faceLandmark68Net.loadFromUri(model),
    ]
}
Promise.all(toload).then(()=>{
    console.log("Models loaded")
    // callback_on_model_load();
})


self.addEventListener('message', function(e) {
    instance += 1
    var message = e.data + 'to myself!';
    self.postMessage(instance);
})