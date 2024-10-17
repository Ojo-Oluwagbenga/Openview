
function recall(){
  setTimeout(() => {
    postMessage("callHandler");
    recall()
  }, 3000);
}
recall()
