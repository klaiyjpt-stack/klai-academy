// 공유: 자동 슬라이더(여러 개) + 라이트박스
document.querySelectorAll('.slider').forEach(s=>{
  const slides=s.querySelector('.slides'), dots=s.querySelector('.dots');
  const N=slides.children.length; let i=0, t;
  const render=()=>{slides.style.transform='translateX('+(-i*100)+'%)'; if(dots)[...dots.children].forEach((d,k)=>d.classList.toggle('on',k===i));};
  const go=k=>{i=(k+N)%N;render();reset();};
  const reset=()=>{clearInterval(t);if(N>1)t=setInterval(()=>go(i+1),3500);};
  if(dots)for(let k=0;k<N;k++){const b=document.createElement('button');b.onclick=()=>go(k);dots.appendChild(b);}
  const p=s.querySelector('.snav.prev'), n=s.querySelector('.snav.next');
  if(p)p.onclick=()=>go(i-1); if(n)n.onclick=()=>go(i+1);
  render();reset();
});
const lb=document.createElement('div'); lb.className='lightbox'; lb.innerHTML='<img alt="">';
lb.onclick=()=>lb.classList.remove('on'); document.body.appendChild(lb);
document.querySelectorAll('[data-lb]').forEach(el=>el.addEventListener('click',()=>{lb.firstChild.src=el.getAttribute('data-lb');lb.classList.add('on');}));
