const downloadButton=document.getElementById('download-button');
const downloadLabel=document.getElementById('download-label');
const downloadDetail=document.getElementById('download-detail');
const downloadNote=document.getElementById('download-note');
const apkPath='downloads/Oxino-1.0.82-arm64-v8a.apk';
const apkName='Oxino-1.0.82-arm64-v8a.apk';
const expectedSize=37885254;
let apkObjectURL=null;
let busy=false;
const digits=new Intl.NumberFormat('fa-IR');
const megabytes=bytes=>(bytes/1024/1024).toLocaleString('fa-IR',{maximumFractionDigits:1});
const downloadProgress=document.createElement('span');
downloadProgress.className='sr-only';
downloadProgress.setAttribute('role','progressbar');
downloadProgress.setAttribute('aria-label','دریافت فایل اکسینو');
downloadProgress.setAttribute('aria-valuemin','0');
downloadProgress.setAttribute('aria-valuemax','100');
downloadProgress.setAttribute('aria-valuenow','0');
downloadProgress.hidden=true;
downloadButton.after(downloadProgress);
downloadNote.setAttribute('role','status');
downloadNote.setAttribute('aria-live','polite');
function saveAPK(){const link=document.createElement('a');link.href=apkObjectURL;link.download=apkName;document.body.append(link);link.click();link.remove()}
function showProgress(received,total){const percent=Math.min(99,Math.floor(received/total*100));downloadButton.style.setProperty('--progress',percent+'%');downloadDetail.textContent=digits.format(percent)+'٪';downloadProgress.setAttribute('aria-valuenow',String(percent));downloadProgress.setAttribute('aria-valuetext',`${digits.format(percent)} درصد، ${megabytes(received)} از ${megabytes(total)} مگابایت`)}
downloadButton.addEventListener('click',async()=>{if(busy)return;if(apkObjectURL){saveAPK();downloadNote.textContent='فایل را از دانلودهای مرورگر باز کن و نصب را ادامه بده.';return}busy=true;downloadButton.disabled=true;downloadButton.classList.remove('failed','complete');downloadButton.classList.add('downloading');downloadButton.setAttribute('aria-busy','true');downloadButton.style.setProperty('--progress','0%');downloadLabel.textContent='در حال دریافت';downloadDetail.textContent='۰٪';downloadNote.textContent='لطفاً تا کامل‌شدن دریافت، این صفحه را باز نگه دار.';downloadProgress.hidden=false;
try{const response=await fetch(apkPath,{cache:'no-store'});if(!response.ok)throw new Error('HTTP '+response.status);const headerLength=Number(response.headers.get('Content-Length'));const total=headerLength>0?headerLength:expectedSize;let received=0;const chunks=[];
if(response.body?.getReader){const reader=response.body.getReader();while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);received+=value.byteLength;showProgress(received,total)}}else{const buffer=await response.arrayBuffer();chunks.push(buffer);received=buffer.byteLength}
if(received!==total)throw new Error('Incomplete APK');apkObjectURL=URL.createObjectURL(new Blob(chunks,{type:'application/vnd.android.package-archive'}));downloadButton.style.setProperty('--progress','100%');downloadProgress.setAttribute('aria-valuenow','100');downloadProgress.setAttribute('aria-valuetext','دریافت کامل شد');downloadButton.classList.remove('downloading');downloadButton.classList.add('complete');downloadLabel.textContent='فایل آماده است';downloadDetail.textContent='۱۰۰٪';downloadNote.textContent='فایل دریافت شد؛ اگر ذخیره شروع نشد، دوباره دکمه را بزن.';saveAPK();
}catch(error){downloadButton.classList.remove('downloading');downloadButton.classList.add('failed');downloadButton.style.setProperty('--progress','0%');downloadLabel.textContent='تلاش دوباره';downloadDetail.textContent='↻';downloadNote.textContent='دریافت کامل نشد. اتصال را بررسی کن و دوباره بزن.';downloadProgress.hidden=true;
}finally{busy=false;downloadButton.disabled=false;downloadButton.removeAttribute('aria-busy')}});
window.addEventListener('pagehide',()=>{if(apkObjectURL){URL.revokeObjectURL(apkObjectURL);apkObjectURL=null;downloadButton.classList.remove('complete');downloadButton.style.setProperty('--progress','0%');downloadLabel.textContent='دانلود اکسینو';downloadDetail.textContent='APK';downloadProgress.hidden=true;downloadNote.textContent='دانلود مستقیم · حدود ۳۶ مگابایت'}});

const copyDialog=document.getElementById('copy-dialog');
const copyURL=document.getElementById('download-url');
let toastTimeout;
function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove('visible'),3200)}
document.getElementById('copy-download').addEventListener('click',async()=>{const url=new URL(apkPath,location.href).href;try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(url);showToast('لینک دانلود کپی شد')}catch{copyURL.value=url;copyDialog.showModal();copyURL.select()}});
for(const id of ['close-copy','done-copy'])document.getElementById(id).addEventListener('click',()=>copyDialog.close());
copyURL.addEventListener('click',()=>copyURL.select());
copyDialog.addEventListener('click',e=>{if(e.target!==copyDialog)return;const r=copyDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)copyDialog.close()});
const mobileBar=document.getElementById('mobile-download');
const downloadCard=document.getElementById('download');
if('IntersectionObserver' in window){const observer=new IntersectionObserver(([entry])=>{mobileBar.hidden=!(entry.boundingClientRect.bottom<0&&!entry.isIntersecting)},{threshold:0});observer.observe(downloadCard)}
