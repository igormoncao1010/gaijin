import { initThree } from './three-scene.js';

initThree();

let coffeeCount = 4328;
const coffeeElement = document.getElementById('coffeeCount');
setInterval(() => { 
  coffeeCount += Math.floor(Math.random() * 3) + 2; 
  if(coffeeElement) coffeeElement.textContent = coffeeCount; 
}, 86400000);

const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if(menuToggle) {
  menuToggle.addEventListener('click', () => { 
    menuToggle.classList.toggle('active'); 
    navLinks.classList.toggle('active'); 
  });
}

const modal = document.getElementById('modal');
const openModalBtns = document.querySelectorAll('#openModalBtn, #openModalBtn2');
const closeModal = document.getElementById('closeModal');
openModalBtns.forEach(btn => btn.addEventListener('click', () => modal.classList.add('active')));
if(closeModal) closeModal.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('active'); });

const projectForm = document.getElementById('projectForm');
if(projectForm) {
  projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome')?.value || '';
    const tipo = document.getElementById('tipo')?.value || '';
    const detalhes = document.getElementById('detalhes')?.value || '';
    if(!nome || !tipo || !detalhes) { 
      alert('Preencha os campos obrigatórios'); 
      return; 
    }
    const msg = `*Novo Projeto*%0A%0ANome: ${nome}%0ATipo: ${tipo}%0ADetalhes: ${detalhes}`;
    window.open(`https://wa.me/5561996067198?text=${msg}`, '_blank');
    modal.classList.remove('active');
    projectForm.reset();
  });
}

const header = document.querySelector('.header');
window.addEventListener('scroll', () => { 
  if(window.scrollY > 50) header.classList.add('scrolled'); 
  else header.classList.remove('scrolled'); 
});

const observer = new IntersectionObserver((entries) => { 
  entries.forEach(e => { 
    if(e.isIntersecting) e.target.classList.add('visible'); 
  }); 
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-up').forEach(el => observer.observe(el));

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const hash = this.getAttribute('href');
    if(hash === "#" || hash === "") return;
    const target = document.querySelector(hash);
    if(target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
    }
  });
});
